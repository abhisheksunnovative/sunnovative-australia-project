
/**
 * customerProjectController.js
 * Customer project APIs â€” view, apply, track, upload documents
 */
import Notification from "../models/Notification.js";
import { ProjectOrder } from '../models/ProjectModel.js';
import EpcEnquiry from '../models/EpcEnquiry.js';
import EpcOrder from '../models/EpcOrder.js';
import { OrderJourneySettings } from '../models/OrderJourneySettings.js';
import { processStepCompletionEngine } from '../utils/stepEngine.js';
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "secret_placeholder",
});

// â”€â”€ GET /api/customer/projects â€” apne saare projects â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getMyProjects = async (req, res) => {
  try {
    // Mobile number se bhi match karo (lead form wale projects link ho jayein)
    const query = {
      $or: [
        { customerId: req.customer._id.toString() },
        { customerMobile: req.customer.mobile },
      ],
    };
    const projects = await ProjectOrder.find(query)
      .sort({ createdAt: -1 })
      .select(
        'orderNumber projectType projectTypeLabel status completionPercentage ' +
        'createdAt systemSizeKW estimatedSubsidy totalProjectCost location ' +
        'pendingActionAlert pendingActionFor assignedEPCName steps isInstallDateFixed preferredInstallDate'
      );
    res.json({ success: true, count: projects.length, data: projects });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// â”€â”€ GET /api/customer/projects/:id â€” single project detail + journey â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const getProjectDetail = async (req, res) => {
  try {
    const project = await ProjectOrder.findOne({
      _id: req.params.id,
      $or: [
        { customerId: req.customer._id.toString() },
        { customerMobile: req.customer.mobile },
      ],
    }).lean();
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Fetch Enquiry to check token status
    const enquiry = await EpcEnquiry.findOne({ orderNumber: project.orderNumber });
    let tokenData = null;
    if (enquiry && enquiry.status === 'Lead' && !enquiry.tokenPaid) {
      tokenData = {
        isPending: true,
        amount: enquiry.tokenAmount
      };
    }

    let epcDetails = null;
    if (project.assignedEPCId) {
      try {
        const { default: EpcPartner } = await import('../models/EpcPartner.js');
        const epc = await EpcPartner.findById(project.assignedEPCId).select("companyName ownerName contactPerson email mobile phone rating totalInstallations city state address kycDocuments").lean();
        if (epc) {
          epcDetails = {
            ...epc,
            contactPerson: epc.ownerName || epc.contactPerson || "Installer Representative",
            contactPersonMobile: epc.mobile || epc.phone || "Not Shared",
            contactPersonEmail: epc.email || "Not Shared"
          };
        }
      } catch (err) {
        console.error("Failed to fetch epcDetails:", err);
      }
    }

    res.json({ success: true, data: { ...project, tokenData, epcDetails } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// â”€â”€ POST /api/customer/projects â€” apply for new project â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const applyForProject = async (req, res) => {
  try {
    let payload = req.body;
    if (typeof req.body.payload === 'string') {
        payload = JSON.parse(req.body.payload);
    }
    const {
      projectType, projectTypeLabel,
      systemSizeKW, monthlyBillAmount,
      estimatedSubsidy, totalProjectCost,
      state, location,
      preferredInstallDate, latitude, longitude
    } = payload;

    if (!projectType)
      return res.status(400).json({ message: 'Project type required' });

    // Enforce 1 active project per project type per customer constraint
    const existingProject = await ProjectOrder.findOne({
      $or: [
        { customerId: req.customer._id.toString() },
        { customerMobile: req.customer.mobile }
      ],
      projectType: projectType || 'residential',
      status: { $nin: ['cancelled', 'closed', 'rejected'] }
    });

    if (existingProject) {
      return res.status(400).json({
        success: false,
        message: `Aapka ${existingProject.orderNumber} project pehle se active hai. Har project type ke liye sirf 1 baar hi apply kar sakte hain.`
      });
    }

    const { findJourneySettings } = await import('../utils/stepEngine.js');
    const resolvedCountry = req.customer?.country || req.country || 'india';
    const journeySettings = await findJourneySettings(resolvedCountry, state, location?.district);

    // Find the specific journey for the selected project type
    const currentJourney = journeySettings?.journeys?.find(j => j.projectType === projectType && j.enabled) || {};

    const minDays = journeySettings?.globalSettings?.minBookingDays || 5;

    // Handle CUSTOMER_SELECT
    const { default: EpcPartner } = await import('../models/EpcPartner.js');
    if (currentJourney?.epcSelectionType === 'CUSTOMER_SELECT' && !payload.selectedEpcId) {
      let epcs = await EpcPartner.find({
        isVerified: true,
        serviceAreas: { $elemMatch: { state: state || 'Gujarat', district: location?.district } }
      }).select('companyName contactPerson totalExperience rating totalInstallations profilePic');
      if (epcs.length === 0) {
        epcs = await EpcPartner.find({
          isVerified: true,
          serviceAreas: { $elemMatch: { state: state || 'Gujarat' } }
        }).select('companyName contactPerson totalExperience rating totalInstallations profilePic');
      }
      return res.status(200).json({
        success: true,
        message: 'Please select an EPC before proceeding.',
        requiresEpcSelection: true,
        availableEpcs: epcs
      });
    }

    if (preferredInstallDate) {
      const selectedDate = new Date(preferredInstallDate);
      const minDate = new Date();
      minDate.setDate(minDate.getDate() + minDays);
      if (selectedDate < minDate) {
        return res.status(400).json({ message: `Install date must be at least ${minDays} days from today.` });
      }
    }

    const rooftopPhotoUrl = req.file ? `/uploads/${req.file.filename}` : (payload.existingBillUrl || "");
    const orderNumber = `SUN-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    const order = await ProjectOrder.create({
      orderNumber,
      projectType,
      projectTypeLabel: projectTypeLabel || projectType,
      customerName:     req.customer.fullName,
      customerMobile:   req.customer.mobile || payload.customerMobile || '',
      customerEmail:    req.customer.email || '',
      customerId:       req.customer._id.toString(),
      systemSizeKW:     systemSizeKW     || 0,
      monthlyBillAmount:monthlyBillAmount || 0,
      estimatedSubsidy: estimatedSubsidy  || 0,
      totalProjectCost: totalProjectCost  || 0,
      state:            state || req.customer.state || 'Gujarat',
      country:          req.customer?.country || req.country || 'india',
      location: {
        ...(location || {}),
        latitude: latitude || null,
        longitude: longitude || null
      },
      rooftopPhoto: rooftopPhotoUrl,
      preferredInstallDate: preferredInstallDate || null,
      status:           'lead',
      completionPercentage: 5,
      pendingActionFor: 'company',
      assignedEPCId: payload.selectedEpcId || null,
      assignedEPCName: payload.selectedEpcName || "",
      paymentStatus: currentJourney?.signupToken?.enabled ? 'pending' : 'not_required',
      documents: rooftopPhotoUrl ? [{ type: 'customer_upload', url: rooftopPhotoUrl, uploadedAt: new Date() }] : [],
      steps: await (async () => {
        const { mapJourneyStepsToProjectSteps } = await import('../utils/stepEngine.js');
        return mapJourneyStepsToProjectSteps(currentJourney?.steps || []);
      })(),
      currentStepTitle: currentJourney?.steps?.[0]?.title || "Lead Captured",
    });

    // Link this project creation back to the BDE's Lead model if exists
    try {
      const LeadModel = (await import('../models/Lead.js')).default;
      const cleanMobile = req.customer.mobile ? req.customer.mobile.replace(/\D/g, '').slice(-10) : '';
      const mobileRegex = cleanMobile ? new RegExp(cleanMobile + '$', 'i') : null;

      const queryOr = [{ customerId: req.customer._id }];
      if (req.customer.mobile) queryOr.push({ mobile: req.customer.mobile });
      if (mobileRegex) queryOr.push({ mobile: mobileRegex });
      if (req.customer.email) queryOr.push({ email: req.customer.email });
      
      const relatedLead = await LeadModel.findOne({ $or: queryOr }).sort({ createdAt: -1 });
      if (relatedLead) {
        relatedLead.history.push({ action: 'Customer Submitted Application', date: new Date() });
        if (preferredInstallDate) relatedLead.preferredInstallDate = new Date(preferredInstallDate);
        if (payload.consumerNumber) relatedLead.consumerNumber = payload.consumerNumber;
        if (rooftopPhotoUrl) relatedLead.rooftopPhoto = rooftopPhotoUrl;
        if (systemSizeKW) relatedLead.kw = systemSizeKW;
        if (projectType) relatedLead.solarType = projectType;
        if (monthlyBillAmount) relatedLead.billAmount = monthlyBillAmount;
        if (payload.selectedEpcId) {
          relatedLead.assignedEPCId = payload.selectedEpcId;
          relatedLead.assignedEPCName = payload.selectedEpcName;
        }
        if (location) {
          relatedLead.address = location.address || relatedLead.address;
          relatedLead.city = location.city || relatedLead.city;
          relatedLead.district = location.city || relatedLead.district;
          relatedLead.state = state || location.state || relatedLead.state;
          relatedLead.pincode = location.pincode || relatedLead.pincode;
        }
        await relatedLead.save();
        order.leadId = relatedLead._id;
        order.assignedBde = relatedLead.assignedBde;
        await order.save();
        relatedLead.convertedProjectId = order._id;
        await relatedLead.save();
      }
    } catch (e) {
      console.error('Error linking project to lead:', e);
    }

    // Auto-complete the first step ("Lead Captured" or "Apply Form")
    if (order.steps && order.steps.length > 0) {
      const { processStepCompletionEngine } = await import('../utils/stepEngine.js');
      await processStepCompletionEngine(order, order.steps[0].stepId, 'Customer', '', 'Application Submitted');
    }

    // Track Trust Badge Assignment & Skipped Analytics
    if (payload.selectedEpcId) {
      try {
        const { default: EpcPartner } = await import('../models/EpcPartner.js');
        const epc = await EpcPartner.findById(payload.selectedEpcId);
        if (epc && epc.trustBadge?.status === 'Approved') {
          epc.trustBadge.assignedCount = (epc.trustBadge.assignedCount || 0) + 1;
          epc.trustBadge.skippedCount = Math.max(0, (epc.trustBadge.skippedCount || 0) - 1);
          await epc.save();
        }
      } catch (err) { 
        console.error('Error updating trustbadge counters:', err); 
      }
    }

        const currencyMap = {
      'australia': 'AUD', 'au': 'AUD',
      'india': 'INR', 'in': 'INR',
      'newzealand': 'NZD', 'nz': 'NZD', 'new_zealand': 'NZD',
      'uk': 'GBP', 'united kingdom': 'GBP',
      'us': 'USD', 'united states': 'USD'
    };
    
    let resolvedCurrency = "INR";
    if (resolvedCountry) {
       const mapped = currencyMap[resolvedCountry.toLowerCase().trim()];
       if (mapped) resolvedCurrency = mapped;
    }

    if (currentJourney?.signupToken?.enabled) {
      order.paymentStatus = 'pending';
      const amountInPaise = Math.round((currentJourney.signupToken.amount || 500) * 100);
      try {
        const options = {
          amount: amountInPaise,
          currency: resolvedCurrency,
          receipt: `rcpt_${order._id}`,
        };
        const rzpOrder = await razorpay.orders.create(options);
        order.razorpayOrderId = rzpOrder.id;
      } catch(rzpErr) {
        console.error("Razorpay order creation failed, but continuing:", rzpErr);
      }
    } else {
      order.paymentStatus = 'paid';
      let targetStep = order.steps?.find(s => s.milestoneType === 'customer_payment' || s.title.toLowerCase().includes("pay") || s.title.toLowerCase().includes("token"));
      if (!targetStep && order.steps?.length > 0) {
        targetStep = order.steps.find(s => s.status === 'in-progress' || s.status === 'pending');
      }
      if (targetStep) {
        const { processStepCompletionEngine } = await import('../utils/stepEngine.js');
        await processStepCompletionEngine(order, targetStep.stepId, 'System', '', 'Token bypassed');
      }
    }
    
    await order.save();

    const LeadModel = (await import('../models/Lead.js')).default;
    const relatedLead = await LeadModel.findById(order.leadId);
    if (relatedLead) {
      if (!currentJourney?.signupToken?.enabled) relatedLead.tokenPaid = true;
      await relatedLead.save();
    }

    // Always Create EPC Enquiry if not exists
    const EpcEnquiry = (await import('../models/EpcEnquiry.js')).default;
    let enquiry = await EpcEnquiry.findOne({ orderNumber: order.orderNumber });
    if (!enquiry) {
      const pTypeMap = {
        "surya-ghar": "Surya Ghar Yojana",
        "residential": "Residential Solar",
        "commercial": "Commercial Solar",
        "group": "Group Solar",
        "au-small-home": "AU Small Home (6.6kW)",
        "au-standard-family": "AU Standard Family (8-10kW)",
        "au-large-home": "AU Large Home (10-13kW)",
        "au-ev-owners": "AU EV Owners (13-20kW)",
        "au-solar-battery": "AU Solar + Battery"
      };
      const mappedType = pTypeMap[order.projectType?.toLowerCase()] || "Residential Solar";

      let enquiryData = {
        customerName: order.customerName,
        customerMobile: order.customerMobile,
        customerEmail: order.customerEmail || "",
        enquiryType: 'ECommerce',
        projectType: mappedType,
        systemCapacityKw: order.systemSizeKW || 1,
        location: order.state ? `${order.location?.district || ''}, ${order.state}, ${order.location?.pincode || ''}` : '',
        state: order.state || 'Unknown',
        district: order.location?.district || order.state || 'Unknown',
        city: order.location?.district || order.state || 'Unknown',
        orderNumber: order.orderNumber,
        preferredInstallDate: order.preferredInstallDate || null,
        status: 'Open For EPC',
      };

      if (order.assignedEPCId) {
        const EpcPartner = (await import('../models/EpcPartner.js')).default;
        const epc = await EpcPartner.findById(order.assignedEPCId);
        if (epc) {
          enquiryData.epcPartner = epc._id.toString();
          enquiryData.assignedEPCName = epc.companyName;
          enquiryData.status = 'Open For EPC';
          
          // Advance step in ProjectOrder since EPC is assigned
          const epcStep = order.steps?.find(s => s.title.toLowerCase().includes("epc assign"));
          if (epcStep) {
            const { processStepCompletionEngine } = await import('../utils/stepEngine.js');
            await processStepCompletionEngine(order, epcStep.stepId, 'System', '', 'EPC auto-assigned via bypassed application');
          }
        }
      }
      enquiry = new EpcEnquiry(enquiryData);
      await enquiry.save();
    }

    if (relatedLead) {
      const { attemptAutoConversion } = await import('./leadController.js');
      await attemptAutoConversion(relatedLead);
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      requiresPayment: false,
      data: order,
    });
  } catch (err) {
    console.error('applyForProject error:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// â”€â”€ POST /api/customer/projects/:id/documents â€” document upload â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const uploadDocument = async (req, res) => {
  try {
    const { documentType } = req.body;
    if (!req.file) return res.status(400).json({ message: 'File required' });

    const fileUrl = `/uploads/${req.file.filename}`;

    const project = await ProjectOrder.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [
          { customerId: req.customer._id.toString() },
          { customerMobile: req.customer.mobile },
        ],
      },
      {
        $push: {
          documents: {
            type:       documentType || 'customer_upload',
            url:        fileUrl,
            uploadedAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ success: true, message: 'Document uploaded!', fileUrl });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// â”€â”€ POST /api/customer/projects/:id/pay-token â€” Simulates Token Payment â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const payToken = async (req, res) => {
  try {
    const project = await ProjectOrder.findOne({
      _id: req.params.id,
      $or: [
        { customerId: req.customer._id.toString() },
        { customerMobile: req.customer.mobile },
      ],
    });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const enquiry = await EpcEnquiry.findOne({ orderNumber: project.orderNumber });
    if (enquiry) {
      enquiry.tokenPaid = true;
      enquiry.tokenPaidAt = new Date();
      enquiry.status = 'Open For EPC';
      await enquiry.save();
    }

    // Find and complete payment step using processStepCompletionEngine
    let targetStep = project.steps?.find(s => s.milestoneType === 'customer_payment' || s.title.toLowerCase().includes("pay") || s.title.toLowerCase().includes("token"));
    if (!targetStep && project.steps?.length > 0) {
      targetStep = project.steps.find(s => s.status === 'in-progress' || s.status === 'pending');
    }

    if (targetStep) {
      await processStepCompletionEngine(project, targetStep.stepId, 'Customer', '', 'Token payment completed');
    }

    await project.save();
    if (project.assignedBDE) { await Notification.create({ role: "bde", title: "Customer Completed a Step", message: `Customer  has completed the step. Current status: `, recipientId: project.assignedBDE }); }
    res.json({ success: true, message: 'Token paid successfully. Order is now Open for EPCs.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// â”€â”€ POST /api/customer/projects/:id/pay-escrow â€” Simulated Escrow â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const payEscrow = async (req, res) => {
  try {
    const enquiry = await EpcEnquiry.findById(req.params.id);
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });

    if (enquiry.status !== 'Date Confirmed') {
      return res.status(400).json({ message: `Cannot pay escrow for enquiry in status: ${enquiry.status}` });
    }

    if (enquiry.customerMobile !== req.customer.mobile) {
      return res.status(403).json({ message: 'Unauthorized to pay for this enquiry' });
    }

    // 1. Mark Enquiry as Escrow Paid
    enquiry.status = 'Escrow Paid';
    await enquiry.save();

    // 2. Automatically generate the Order (simulate convertToOrder)
    const { totalProjectCost } = req.body;
    
    // Default fallback (India)
    let amount90 = totalProjectCost ? totalProjectCost * 0.9 : 0;
    let amount10 = totalProjectCost ? totalProjectCost * 0.1 : 0;
    let status90 = 'Escrowed';
    let status10 = 'Pending';

    const isAu = enquiry.country?.toLowerCase() === 'australia' || req.customer?.country?.toLowerCase() === 'australia';

    if (isAu) {
      const { default: CustomerPaymentSettings } = await import('../models/CustomerPaymentSettings.js');
      const paySettings = await CustomerPaymentSettings.findOne({ country: 'australia' });
      if (paySettings) {
        const config = paySettings.projectConfigs?.find(c => c.projectType === enquiry.projectType);
        if (config) {
          if (config.paymentMode === 'PAYMENT_LATER') {
             status90 = 'Pending';
             amount90 = totalProjectCost || 0; // EPC collects all later
             amount10 = 0;
          } else if (config.paymentMode === 'ADVANCE_ESCROW') {
             if (config.escrow.mode === 'PERCENTAGE') {
               amount90 = totalProjectCost ? (totalProjectCost * config.escrow.percentage) / 100 : 0;
               amount10 = totalProjectCost ? totalProjectCost - amount90 : 0;
             } else if (config.escrow.mode === 'TOKEN') {
               amount90 = config.escrow.tokenAmount || 0;
               amount10 = totalProjectCost ? totalProjectCost - amount90 : 0;
             } else if (config.escrow.mode === 'FULL') {
               amount90 = totalProjectCost || 0;
               amount10 = 0;
             }
             // For MILESTONES we would map it to a dynamic array, but keeping payment90/10 structure for compatibility
          }
        }
      }
    }

    const order = await EpcOrder.create({
      epcPartner:        enquiry.epcPartner,
      enquiry:           enquiry._id,
      customerName:      enquiry.customerName,
      customerMobile:    enquiry.customerMobile,
      customerEmail:     enquiry.customerEmail,
      projectType:       enquiry.projectType,
      systemCapacityKw:  enquiry.systemCapacityKw,
      state:             enquiry.state,
      district:          enquiry.district,
      city:              enquiry.city,
      address:           enquiry.address,
      country:           isAu ? 'australia' : (enquiry.country || 'india'),
      totalProjectValue: totalProjectCost || 0,
      payment90: {
        amount: amount90,
        status: status90,
      },
      payment10: {
        amount: amount10,
        status: status10,
      },
      stage:  'Registration Started',
      status: 'New',
    });

    enquiry.status = 'Converted';
    enquiry.convertedToOrder = order._id;
    enquiry.convertedAt = new Date();
    await enquiry.save();

    res.status(200).json({
      success: true,
      message: 'Escrow paid successfully. Order has been generated.',
      order,
    });
  } catch (err) {
    console.error('payEscrow error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
// -- GET /api/customer/epcs — Get available EPCs for selection ---------------
