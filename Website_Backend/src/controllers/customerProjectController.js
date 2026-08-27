
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
    const { EpcPartner } = await import('../models/EpcPartner.js');
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
      const amountInPaise = Math.round((currentJourney.signupToken.amount || 500) * 100);
      const options = {
        amount: amountInPaise,
        currency: resolvedCurrency,
        receipt: `rcpt_${order._id}`,
      };
      const rzpOrder = await razorpay.orders.create(options);
      
      order.razorpayOrderId = rzpOrder.id;
      // Note: we can skip saving currency on the order if schema doesn't support it.
      await order.save();

      return res.status(201).json({
        success: true,
        message: 'Payment required',
        requiresPayment: true,
        amount: options.amount / 100,
        currency: resolvedCurrency,
        razorpayOrderId: rzpOrder.id,
        key_id: process.env.RAZORPAY_KEY_ID,
        data: order,
      });
    } else {
      // Token is bypassed: trigger token success logic immediately
      order.paymentStatus = 'paid';
      
      let targetStep = order.steps?.find(s => s.milestoneType === 'customer_payment' || s.title.toLowerCase().includes("pay") || s.title.toLowerCase().includes("token"));
      if (!targetStep && order.steps?.length > 0) {
        targetStep = order.steps.find(s => s.status === 'in-progress' || s.status === 'pending');
      }
      if (targetStep) {
        const { processStepCompletionEngine } = await import('../utils/stepEngine.js');
        await processStepCompletionEngine(order, targetStep.stepId, 'System', '', 'Token bypassed');
      }
      await order.save();

      const LeadModel = (await import('../models/Lead.js')).default;
      const relatedLead = await LeadModel.findById(order.leadId);
      if (relatedLead) {
        relatedLead.tokenPaid = true;
        await relatedLead.save();
      }

      // Create EPC Enquiry if not exists
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
            enquiryData.status = 'EPC Accepted';
            
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
    }
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
export const getAvailableEpcs = async (req, res) => {
  try {
    const fs = await import('fs');
    fs.appendFileSync('epc_requests.log', JSON.stringify({ query: req.query, date: new Date() }) + '\n');
    
    const { state, district, country = req.customer?.country || 'india' } = req.query;
    const { default: EpcPartner } = await import('../models/EpcPartner.js');
    
    const isAu = country.toLowerCase() === 'australia';

    // Find EPCs matching state and district (and must be verified/active)
    // If Australia, we need to match by country too.
    // Support existing serviceAreas or activeDistricts
    // We removed isVerified: true because user requested EPCs with rates should show instantly without admin approval
    let query = {};
    if (isAu) {
      query.country = "australia";
    }
    
    const stateRegex = new RegExp(`^${state || 'Queensland'}$`, 'i');
    const stateMatch = { $in: [stateRegex, /^all$/i] };
    
    query.$or = [
      { serviceAreas: { $elemMatch: { state: stateMatch } } },
      { activeDistricts: stateMatch }
    ];
    // Keep standard fallback
    if (!state) {
        query.$or[0].serviceAreas.$elemMatch.state = { $in: [/^Gujarat$/i, /^all$/i] };
        query.$or[1].activeDistricts = { $in: [/^Gujarat$/i, /^all$/i] };
    }

    if (district && district !== 'All') {
       const distRegex = new RegExp(`^${district}$`, 'i');
       query.$or[0].serviceAreas.$elemMatch.district = { $in: [distRegex, /^all$/i] };
       query.$or[1].activeDistricts = { $in: [distRegex, /^all$/i] };
    }

    let brandIds = [];
    if (req.query.brands) {
      let brandsQuery = typeof req.query.brands === 'string' ? req.query.brands.split(',') : req.query.brands;
      const { default: Brand } = await import('../models/Brand.js');
      const brandDocs = await Brand.find({ name: { $in: brandsQuery.map(b => new RegExp('^' + b.trim() + '$', 'i')) } });
      brandIds = brandDocs.map(b => b._id);
      
      if (brandIds.length > 0) {
        // Find EPCs who have submitted rates for these brands in ProjectPricing
        const { default: ProjectPricing } = await import('../models/ProjectPricing.js');
        const pricingDocs = await ProjectPricing.find({
          dynamicBrands: {
            $elemMatch: {
              brandIds: { $in: brandIds }
            }
          }
        });
        
        const epcIdsWithRates = pricingDocs.map(p => p.epcId).filter(id => id);

        // Also check older brandOfferings just in case
        query.$and = query.$and || [];
        query.$and.push({
          $or: [
            { _id: { $in: epcIdsWithRates } },
            {
              brandOfferings: {
                $elemMatch: {
                  $or: [
                    { solarBrands: { $in: brandIds } },
                    { inverterBrands: { $in: brandIds } }
                  ]
                }
              }
            }
          ]
        });
      } else {
        return res.json({ success: true, count: 0, data: [] });
      }
    }

    let epcs = await EpcPartner.find(query)
       .select('companyName contactPerson totalExperience rating totalInstallations profilePic installerCount weeklyCapacityKw trustBadge country');

    // Also get fallback if no district match (but state match)
    if (epcs.length === 0 && district && district !== 'All') {
      let fallbackQuery = {};
      if (isAu) fallbackQuery.country = "australia";
      
      fallbackQuery.$or = [
        { serviceAreas: { $elemMatch: { state: stateMatch } } },
        { activeDistricts: stateMatch }
      ];
      
      if (query.$and) {
          fallbackQuery.$and = query.$and;
      }
      
      epcs = await EpcPartner.find(fallbackQuery)
         .select('companyName contactPerson totalExperience rating totalInstallations profilePic installerCount weeklyCapacityKw trustBadge country');
    }

    let finalEpcs = epcs;
    if (isAu) {
      const { default: EpcSystemSettings } = await import('../models/EpcSystemSettings.js');
      const sysSettings = await EpcSystemSettings.getSingleton();
      let limit = 5; // default fallback
      let priorities = ['lowestLeads', 'rating']; // default fallback

      if (sysSettings.regionRules) {
        const resolvedState = state || 'Victoria';
        const resolvedProjectType = req.query.projectType || 'residential';
        const rule = sysSettings.regionRules.find(r => 
           r.country.toLowerCase() === country.toLowerCase() && 
           r.state.toLowerCase() === resolvedState.toLowerCase() && 
           r.projectType === resolvedProjectType
        ) || sysSettings.regionRules.find(r => 
           r.country.toLowerCase() === country.toLowerCase() && 
           r.state.toLowerCase() === 'all' && 
           r.projectType === resolvedProjectType
        );
        if (rule) {
           limit = rule.customerSelectEpcSettings?.totalEpcCards || limit;
        }
      }

      if (true) {
        
        // Helper to sort considering priorities (0 orders/lowest leads, rating)
        const sortEpcs = (list) => {
          return list.sort((a, b) => {
            for (let prio of priorities) {
              if (prio === 'rating') {
                if (b.rating !== a.rating) return (b.rating || 0) - (a.rating || 0);
              }
              if (prio === 'lowestLeads') {
                if (a.totalInstallations !== b.totalInstallations) return (a.totalInstallations || 0) - (b.totalInstallations || 0);
              }
            }
            return 0;
          });
        };

        // 1. Separate Trust Badge and Non-Trust Badge EPCs
        let tbEpcs = [];
        let nmEpcs = [];
        finalEpcs.forEach(epc => {
           if (epc.trustBadge?.status === 'Approved') tbEpcs.push(epc);
           else nmEpcs.push(epc);
        });

        // 2. Sort both lists
        tbEpcs = sortEpcs(tbEpcs);
        nmEpcs = sortEpcs(nmEpcs);

        // 3. Dynamic Ratio Algorithm
        const totalPool = tbEpcs.length + nmEpcs.length;
        if (totalPool === 0) {
          finalEpcs = [];
        } else {
          const tbRatio = tbEpcs.length / totalPool;
          let tbCount = 0;
          let nmCount = 0;

          if (tbEpcs.length === 0) {
            nmCount = limit;
          } else if (tbRatio < 0.5) {
            tbCount = Math.ceil(limit * 0.5);
            nmCount = limit - tbCount;
          } else if (tbRatio >= 0.5 && tbRatio <= 0.6) {
            tbCount = Math.ceil(limit * 0.6);
            nmCount = limit - tbCount;
          } else {
            tbCount = Math.ceil(limit * 0.8);
            nmCount = limit - tbCount;
          }

          if (tbEpcs.length < tbCount) {
             nmCount += (tbCount - tbEpcs.length);
             tbCount = tbEpcs.length;
          }
          if (nmEpcs.length < nmCount) {
             tbCount += (nmCount - nmEpcs.length);
             nmCount = nmEpcs.length;
          }
          // Final cap: ensure counts don't exceed available
          tbCount = Math.min(tbCount, tbEpcs.length);
          nmCount = Math.min(nmCount, nmEpcs.length);

          finalEpcs = [
            ...tbEpcs.slice(0, tbCount),
            ...nmEpcs.slice(0, nmCount)
          ];
          
          // Re-sort final list so Trust Badge holders appear above NM based on priority
          finalEpcs.sort((a, b) => {
            const aTrust = a.trustBadge?.status === 'Approved' ? 1 : 0;
            const bTrust = b.trustBadge?.status === 'Approved' ? 1 : 0;
            if (bTrust !== aTrust) return bTrust - aTrust;
            for (let prio of priorities) {
              if (prio === 'rating') {
                if (b.rating !== a.rating) return (b.rating || 0) - (a.rating || 0);
              }
              if (prio === 'lowestLeads') {
                if (a.totalInstallations !== b.totalInstallations) return (a.totalInstallations || 0) - (b.totalInstallations || 0);
              }
            }
            return 0;
          });
        }
      }
    }

    // Decrement views for Trust Badge holders that are being shown
    if (finalEpcs.length > 0) {
      const tbShownIds = finalEpcs
        .filter(epc => epc.trustBadge?.status === 'Approved' && epc.trustBadge?.remainingViews > 0)
        .map(epc => epc._id);
      
      if (tbShownIds.length > 0) {
        for (const epcId of tbShownIds) {
          const epc = await EpcPartner.findById(epcId);
          if (epc && epc.trustBadge) {
            epc.trustBadge.remainingViews -= 1;
            epc.trustBadge.skippedCount = (epc.trustBadge.skippedCount || 0) + 1;
            
            if (epc.trustBadge.remainingViews <= 0) {
              epc.trustBadge.status = 'Expired';
              const Notification = (await import('../models/Notification.js')).default;
              await Notification.create({
                role: 'EpcPartner',
                recipientId: epc._id,
                title: 'Trust Badge Expired',
                message: 'Your Trust Badge has expired because you have used all your views. Please apply again.'
              });
            }
            await epc.save();
          }
        }
      }
    }

    const { kw, projectType } = req.query;
    let finalEpcsObj = finalEpcs.map(e => e.toObject ? e.toObject() : e);

    if (kw && projectType) {
      const { default: ProjectPricing } = await import('../models/ProjectPricing.js');
      const searchPattern = '^' + projectType.replace('-solar', '') + '(-solar)?$';
      const pricingDocs = await ProjectPricing.find({
        epcId: { $in: finalEpcsObj.map(e => e._id) },
        systemSizeKW: Number(kw),
        projectType: new RegExp(searchPattern, 'i')
      }).lean();

      const brandIdStrings = brandIds.map(id => id.toString());

      finalEpcsObj = finalEpcsObj.map(epc => {
        const epcPricing = pricingDocs.filter(p => {
          if (!p.epcId || p.epcId.toString() !== epc._id.toString()) return false;
          
          if (brandIdStrings.length > 0) {
            const hasDirectBrand = (p.solarPanel && brandIdStrings.includes(p.solarPanel.toString())) ||
                                   (p.inverter && brandIdStrings.includes(p.inverter.toString()));
            if (hasDirectBrand) return true;
            
            if (p.dynamicBrands && p.dynamicBrands.length > 0) {
              const hasDynamicBrand = p.dynamicBrands.some(db => 
                db.brandIds && db.brandIds.some(bid => brandIdStrings.includes(bid.toString()))
              );
              return hasDynamicBrand;
            }
            return false;
          }
          return true;
        });

        const validPrices = epcPricing.map(p => p.projectPrice || 0).filter(p => p > 0);
        if (validPrices.length > 0) {
           epc.projectPrice = Math.min(...validPrices);
        }
        return epc;
      });
    }

    res.json({ success: true, count: finalEpcsObj.length, data: finalEpcsObj });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// -- POST /api/customer/projects/:id/complete-step -- Complete a customer assigned step --
export const completeStep = async (req, res) => {
  try {
    const { stepId, note, uploadedActions: rawActions } = req.body;
    
    const project = await ProjectOrder.findOne({
      _id: req.params.id,
      $or: [
        { customerId: req.customer._id.toString() },
        { customerMobile: req.customer.mobile }
      ]
    });
    
    if (!project) return res.status(404).json({ message: 'Project not found' });

    let uploadedActions = [];
    if (rawActions) {
      try {
        uploadedActions = typeof rawActions === 'string' ? JSON.parse(rawActions) : rawActions;
      } catch (err) {
        console.error('Error parsing uploadedActions:', err);
      }
    }

    let fileUrl = "";
    if (req.file) {
      fileUrl = `/${req.file.path.replace(/\\/g, '/')}`;
    }

    const result = await processStepCompletionEngine(
      project,
      stepId,
      req.customer.name || 'Customer',
      fileUrl,
      note || '',
      'customer',
      uploadedActions
    );

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    await project.save();
    res.json({ success: true, message: 'Step completed successfully', project });
  } catch (error) {
    console.error('Customer completeStep error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const signStcForm = async (req, res) => {
  try {
    const { signatureUrl } = req.body;
    const project = await ProjectOrder.findOne({ _id: req.params.id, customer: req.customer._id });
    if (!project) return res.status(404).json({ message: "Project not found" });
    
    if (!project.stcStatus) {
      project.stcStatus = {};
    }
    
    project.stcStatus.assignmentFormSigned = true;
    project.stcStatus.assignmentFormSignedAt = new Date();
    project.stcStatus.customerSignatureUrl = signatureUrl;
    await project.save();
    
    res.json({ success: true, message: "STC Assignment Form signed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const rateEpc = async (req, res) => {
  try {
    const { rating, reviewComment, comment, feedback } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Invalid rating. Must be between 1 and 5.' });
    }

    const project = await ProjectOrder.findOne({
      _id: req.params.id,
      $or: [
        { customerId: req.customer._id.toString() },
        { customerMobile: req.customer.mobile },
      ],
    });

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (!project.assignedEPCId) {
      return res.status(400).json({ success: false, message: 'No installer assigned to this project yet.' });
    }
    if (project.customerRating > 0) {
      return res.status(400).json({ success: false, message: 'You have already rated this installer.' });
    }

    // Check if the project is completed
    const isCompleted = ["completed", "closed", "Project Completed", "Warranty Activated", "Installation Completed"].includes(project.status) || project.completionPercentage >= 90;
    if (!isCompleted) {
      return res.status(400).json({ success: false, message: 'Rating can only be submitted after the installation is completed.' });
    }

    const { default: EpcPartner } = await import('../models/EpcPartner.js');
    const epc = await EpcPartner.findById(project.assignedEPCId);
    if (epc) {
      const currentTotal = epc.totalRatings || 0;
      const currentRating = epc.rating || 0;
      const newTotal = currentTotal + 1;
      const newAvgRating = ((currentRating * currentTotal) + Number(rating)) / newTotal;

      epc.rating = Math.round(newAvgRating * 10) / 10;
      epc.totalRatings = newTotal;

      if (epc.rating < 3.0 && epc.totalRatings >= 3) {
        epc.isActive = false;
        epc.deactivationReason = "Auto-deactivated due to average rating falling below 3.0 stars";
      }

      await epc.save();
    }

    project.customerRating = Number(rating);
    project.customerReviewComment = reviewComment || comment || feedback || "";
    project.customerRatedAt = new Date();
    await project.save();

    res.json({ 
      success: true, 
      message: 'Thank you for your rating and feedback!', 
      customerRating: project.customerRating,
      customerReviewComment: project.customerReviewComment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProjectDetail = async (req, res) => {
  try {
    const { address, city, pincode, preferredInstallDate, latitude, longitude } = req.body;
    
    const project = await ProjectOrder.findOne({
      _id: req.params.id,
      $or: [
        { customerId: req.customer._id.toString() },
        { customerMobile: req.customer.mobile }
      ]
    });

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (project.location) {
      if (address) project.location.address = address;
      if (city) project.location.city = city;
      if (pincode) project.location.pincode = pincode;
    } else {
      project.location = { address, city, pincode, state: project.state };
    }

    if (preferredInstallDate) {
      project.preferredInstallDate = new Date(preferredInstallDate);
    }
    if (latitude) project.latitude = Number(latitude);
    if (longitude) project.longitude = Number(longitude);

    if (req.file) {
      project.rooftopPhoto = `/uploads/${req.file.filename}`;
    }

    await project.save();
    res.json({ success: true, message: "Project details updated successfully", data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const selectRecommendedEpc = async (req, res) => {
  try {
    const { id } = req.params;
    const { epcId } = req.body;
    if (!epcId) return res.status(400).json({ success: false, message: 'Please select an EPC Partner' });

    const project = await ProjectOrder.findOne({
      _id: id,
      $or: [
        { customerId: req.customer._id.toString() },
        { customerMobile: req.customer.mobile }
      ]
    });

    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const { default: EpcPartner } = await import('../models/EpcPartner.js');
    const epc = await EpcPartner.findById(epcId);
    if (!epc) return res.status(404).json({ success: false, message: 'EPC Partner not found' });

    project.assignedEPCId = epc._id;
    project.assignedEPCName = epc.companyName;
    project.bdeRecommendationStatus = 'accepted';
    project.status = 'EPC Accepted';
    project.pendingActionAlert = 'EPC Accepted your project! Site survey scheduled.';
    project.pendingActionFor = 'epc-partner';

    await project.save();

    // Track Trust Badge Assignment & Skipped Analytics
    try {
      if (epc.trustBadge?.status === 'Approved') {
        epc.trustBadge.assignedCount = (epc.trustBadge.assignedCount || 0) + 1;
        epc.trustBadge.skippedCount = Math.max(0, (epc.trustBadge.skippedCount || 0) - 1);
        await epc.save();
      }
    } catch (err) { 
      console.error('Error updating trustbadge counters:', err); 
    }

    // Sync Lead model
    try {
      const LeadModel = (await import('../models/Lead.js')).default;
      await LeadModel.updateOne(
        { $or: [{ convertedProjectId: project._id }, { mobile: project.customerMobile }] },
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
    } catch (lErr) {
      console.error('Lead update error:', lErr);
    }

    // Trigger Notification for BDE & Admin
    try {
      const Notification = (await import('../models/Notification.js')).default;
      await Notification.create({
        role: 'BDE',
        recipientId: project.assignedBde ? project.assignedBde : null,
        title: '⚡ Customer Accepted EPC Installer!',
        message: `Customer ${project.customerName} has accepted ${epc.companyName}. You can now align and confirm the final installation date!`,
        projectId: project._id
      });
    } catch (nErr) {
      console.error('BDE notification error:', nErr);
    }

    res.json({ success: true, project, message: `Successfully accepted ${epc.companyName} as your EPC installer!` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};







