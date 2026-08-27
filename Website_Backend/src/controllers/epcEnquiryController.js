import EpcEnquiry from '../models/EpcEnquiry.js';
import EpcOrder from '../models/EpcOrder.js';
import EpcPartner from '../models/EpcPartner.js';
import { deductCreditsForOrder } from './epcWalletController.js';

export const getMyEnquiries = async (req, res) => {
  try {
    const epc = await EpcPartner.findById(req.epc._id);
    const { status, projectType, district, enquiryType } = req.query;

    let filter = {};
    let nullEpcCondition = {
      epcPartner: null,
      status: { $in: ['Open For EPC', 'Bid Running', 'Lead', 'Token Paid', 'Order Generated'] }
    };

    if (epc.country?.toLowerCase() === 'india' || !epc.country) {
      nullEpcCondition.state = epc.state;
    } else {
      let allowedDistricts = [];
      if (epc.plan === 'Free' || epc.plan === '1 Installer Plan') {
        allowedDistricts = [epc.district];
      } else {
        allowedDistricts = epc.activeDistricts && epc.activeDistricts.length > 0 ? epc.activeDistricts : [epc.district];
      }
      nullEpcCondition.district = { $in: allowedDistricts };
    }

    filter.$or = [
      { epcPartner: req.epc._id },
      nullEpcCondition
    ];

    if (epc.trustBadge?.status !== 'Approved') {
      // Normal EPCs cannot see leads created in the last 60 minutes
      const delayMinutes = process.env.TRUST_BADGE_DELAY_MINUTES || 60;
      const delayTime = new Date(Date.now() - delayMinutes * 60 * 1000);
      filter.createdAt = { $lte: delayTime };
    }

    if (status)      filter.status      = status;
    if (projectType) filter.projectType = projectType;
    if (enquiryType) filter.enquiryType = enquiryType;
    if (district && epc.activeDistricts.includes(district)) {
      filter.district = district;
    }

    const enquiries = await EpcEnquiry.find(filter).sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (err) {
    console.error('getMyEnquiries error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getEnquiryById = async (req, res) => {
  try {
    const enquiry = await EpcEnquiry.findById(req.params.id);
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });
    res.json(enquiry);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const acceptEnquiry = async (req, res) => {
  try {
    const epcId = req.epc._id;
    const enquiryId = req.params.id;

    // 1. First fetch to check district & basic eligibility before locking
    const enquiryCheck = await EpcEnquiry.findById(enquiryId);
    if (!enquiryCheck) return res.status(404).json({ message: 'Enquiry not found' });

    const acceptableStatuses = ['Open For EPC', 'Bid Running', 'New'];
    if (!acceptableStatuses.includes(enquiryCheck.status)) {
      return res.status(400).json({
        message: `Cannot accept enquiry with status: ${enquiryCheck.status}`
      });
    }

    const epc = await EpcPartner.findById(epcId);

    if (epc.isFrozen) {
      return res.status(403).json({ message: 'Your account is currently frozen due to overdue projects. Please complete them to accept new orders.' });
    }

    if (epc.country?.toLowerCase() === 'india' || !epc.country) {
      if (epc.state !== enquiryCheck.state) {
        return res.status(403).json({ message: 'This enquiry belongs to a different state.' });
      }
    } else {
      let allowedDistricts = [];
      if (epc.plan === 'Free' || epc.plan === '1 Installer Plan') {
        allowedDistricts = [epc.district];
      } else {
        allowedDistricts = epc.activeDistricts && epc.activeDistricts.length > 0 ? epc.activeDistricts : [epc.district];
      }
  
      if (!allowedDistricts.includes(enquiryCheck.district)) {
        return res.status(403).json({ message: 'This district is not available in your current plan. Upgrade to 2 or 3 Installer Plan to access other districts.' });
      }
    }

    // District-wise Weekly Plan Check
    const targetDistrict = enquiryCheck.district;
    const districtCap = epc.districtCapacities?.find(d => d.district === targetDistrict);
    const maxWeeklyKw = districtCap ? districtCap.weeklyCapacityKw : 25; // default 25 if not explicitly purchased yet but active

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Only fetch enquiries for this specific district!
    const recentEnquiries = await EpcEnquiry.find({
      epcPartner: epcId,
      district: targetDistrict,
      acceptedAt: { $gte: sevenDaysAgo },
    });
    
    const currentlyUsedKw = recentEnquiries.reduce((acc, curr) => acc + (curr.systemCapacityKw || 1), 0);
    const kwRequired = enquiryCheck.systemCapacityKw || 1;
    
    if (currentlyUsedKw + kwRequired > maxWeeklyKw) {
      return res.status(403).json({ message: `Your capacity for ${targetDistrict} allows ${maxWeeklyKw} kW per week. You have accepted ${currentlyUsedKw} kW in the last 7 days. Upgrade your team capacity for ${targetDistrict} to accept this project.` });
    }

    // Trust Badge Leads limit check
    if (epc.trustBadge?.status === 'Approved' && epc.trustBadge?.remainingLeads <= 0) {
      // It's up to business logic if we block or they just don't get the trust badge fast-track.
      // Given the requirement is to 'track' trust badge usage and decrement limits, we can let them accept, but they just use regular leads?
      // Actually, if they are accepting it in the first 60 mins, they MUST have remaining leads.
      const delayMinutes = process.env.TRUST_BADGE_DELAY_MINUTES || 60;
      const delayTime = new Date(Date.now() - delayMinutes * 60 * 1000);
      if (enquiryCheck.createdAt > delayTime) {
        return res.status(403).json({ message: 'Your Trust Badge lead quota is exhausted. You cannot accept fresh (priority) leads right now.' });
      }
    }

    // 2. Atomic Lock for FCFS — Only one EPC can transition it from 'Open For EPC' to 'Processing Acceptance'
    const lockedEnquiry = await EpcEnquiry.findOneAndUpdate(
      { _id: enquiryId, status: { $in: acceptableStatuses } },
      { $set: { status: 'Processing Acceptance', epcPartner: epcId } },
      { new: true }
    );

    if (!lockedEnquiry) {
      return res.status(409).json({ message: 'Sorry! This lead was just claimed by another EPC partner.' });
    }

    try {
      // 3. Deduct Wallet Points
      await deductCreditsForOrder(epcId, lockedEnquiry.projectType, kwRequired, enquiryId, true);

      // Decrement Trust Badge leads if they accepted a priority lead
      const delayMinutes = process.env.TRUST_BADGE_DELAY_MINUTES || 60;
      const delayTime = new Date(Date.now() - delayMinutes * 60 * 1000);
      if (epc.trustBadge?.status === 'Approved' && epc.trustBadge?.remainingLeads > 0 && lockedEnquiry.createdAt > delayTime) {
         epc.trustBadge.remainingLeads -= 1;
         await epc.save();
      }

      // 4. Successful Deduction -> Finalize Acceptance
      const deadline = new Date();
      deadline.setHours(deadline.getHours() + 24);

      lockedEnquiry.status = 'EPC Accepted';
      lockedEnquiry.acceptedAt = new Date();
      lockedEnquiry.customerSelectionDeadline = deadline;
      await lockedEnquiry.save();

      // Sync to ProjectOrder & Lead
      try {
        const { ProjectOrder } = await import('../models/ProjectModel.js');
        const EpcPartner = (await import('../models/EpcPartner.js')).default;
        const epc = await EpcPartner.findById(epcId);
        
        if (epc) {
          // Update ProjectOrder
          const project = await ProjectOrder.findOne({ orderNumber: lockedEnquiry.orderNumber });
          if (project) {
            project.assignedEPCId = epc._id.toString();
            project.assignedEPCName = epc.companyName;
            project.status = 'EPC Accepted';
            project.pendingActionAlert = 'EPC Partner accepted your project! Site survey scheduled.';
            project.pendingActionFor = 'epc-partner';
            
            const { processStepCompletionEngine } = await import('../utils/stepEngine.js');
            const targetStep = project.steps?.find(s => s.title.includes('EPC Assign'));
            if (targetStep) {
               await processStepCompletionEngine(project, targetStep.stepId, 'System', '', 'EPC Accepted the order');
            }
            
            await project.save();
          }

          // Update Lead Model
          const LeadModel = (await import('../models/Lead.js')).default;
          await LeadModel.updateOne(
            { mobile: lockedEnquiry.customerMobile },
            { 
              assignedEPCId: epc._id, 
              assignedEPCName: epc.companyName, 
              enquiryStatus: 'EPC Accepted',
              epcDetails: {
                companyName: epc.companyName,
                contactPerson: epc.ownerName || epc.contactPerson,
                mobile: epc.mobile,
                email: epc.email,
                rating: epc.rating
              }
            }
          );
        }
      } catch (syncErr) {
        console.error('Error syncing ProjectOrder and Lead on FCFS acceptance:', syncErr);
      }

      res.json({
        message: 'Enquiry accepted! You must confirm installation date within 24 hours.',
        enquiry: lockedEnquiry,
        customerDeadline: deadline,
      });

    } catch (deductionError) {
      // Rollback the lock if wallet deduction fails (e.g. insufficient balance)
      await EpcEnquiry.findByIdAndUpdate(enquiryId, { $set: { status: 'Open For EPC', epcPartner: null } });
      return res.status(400).json({ message: deductionError.message || 'Failed to deduct wallet points. Acceptance reverted.' });
    }

  } catch (err) {
    console.error('acceptEnquiry error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const confirmInstallDate = async (req, res) => {
  try {
    const enquiry = await EpcEnquiry.findById(req.params.id);
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });

    if (enquiry.status !== 'EPC Accepted') {
      return res.status(400).json({ message: `Cannot confirm date for enquiry with status: ${enquiry.status}` });
    }

    if (enquiry.epcPartner.toString() !== req.epc._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to confirm this enquiry' });
    }

    const { scheduledInstallDate } = req.body;
    if (!scheduledInstallDate) return res.status(400).json({ message: 'Scheduled Install Date is required' });

    enquiry.status = 'Date Confirmed';
    // Optionally save the date on the enquiry or pass it when converting to order
    // For now we just mark the status. The real order gets the date when Customer pays Escrow.

    await enquiry.save();
    res.json({ message: 'Install date confirmed. Customer will now be prompted for Escrow Payment.', enquiry });
  } catch (err) {
    console.error('confirmInstallDate error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const convertToOrder = async (req, res) => {
  try {
    const enquiry = await EpcEnquiry.findById(req.params.id);
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });
    if (enquiry.convertedToOrder) {
      return res.status(400).json({ message: 'Already converted to order' });
    }

    const convertibleStatuses = ['EPC Accepted', 'Customer Selected EPC'];
    if (!convertibleStatuses.includes(enquiry.status)) {
      return res.status(400).json({
        message: `Enquiry status must be 'EPC Accepted' or 'Customer Selected EPC' to convert`
      });
    }

    const { totalProjectValue, scheduledInstallDate, dueDateForCompletion } = req.body;

    const order = await EpcOrder.create({
      epcPartner:        enquiry.epcPartner,
      enquiry:            enquiry._id,
      customerName:      enquiry.customerName,
      customerMobile:    enquiry.customerMobile,
      customerEmail:      enquiry.customerEmail,
      projectType:        enquiry.projectType,
      systemCapacityKw:  enquiry.systemCapacityKw,
      state:              enquiry.state,
      district:          enquiry.district,
      city:              enquiry.city,
      address:            enquiry.address,
      totalProjectValue: totalProjectValue || 0,
      payment90: {
        amount: totalProjectValue ? totalProjectValue * 0.9 : 0,
        status: 'Pending',
      },
      payment10: {
        amount: totalProjectValue ? totalProjectValue * 0.1 : 0,
        status: 'Pending',
      },
      stage:  'Registration Started',
      status: 'New',
      scheduledInstallDate,
      dueDateForCompletion,
    });

    enquiry.status           = 'Converted';
    enquiry.convertedToOrder = order._id;
    enquiry.convertedAt      = new Date();
    await enquiry.save();

    res.status(201).json({ message: 'Order created successfully', order });
  } catch (err) {
    console.error('convertToOrder error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};