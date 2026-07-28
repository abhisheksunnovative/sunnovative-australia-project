/**
 * customerProjectController.js
 * Customer project APIs â€” view, apply, track, upload documents
 */
import { ProjectOrder } from '../models/ProjectModel.js';
import EpcEnquiry from '../models/EpcEnquiry.js';
import EpcOrder from '../models/EpcOrder.js';
import { OrderJourneySettings } from '../models/OrderJourneySettings.js';
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
        'pendingActionAlert pendingActionFor assignedEPCName steps'
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

    res.json({ success: true, data: { ...project, tokenData } });
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

    let journeySettings = await OrderJourneySettings.findOne({
      country: req.country || 'india',
      state: state || 'all',
      district: location?.district || 'all'
    });
    
    // Fallbacks
    if (!journeySettings) {
      journeySettings = await OrderJourneySettings.findOne({ country: 'india', state: state || 'all', district: 'all' });
    }
    if (!journeySettings) {
      journeySettings = await OrderJourneySettings.findOne({ country: 'india', state: 'all', district: 'all' });
    }
    if (!journeySettings) {
      journeySettings = await OrderJourneySettings.findOne(); // absolute fallback
    }

    // Find the specific journey for the selected project type
    const currentJourney = journeySettings?.journeys?.find(j => j.projectType === projectType) || {};

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

    const rooftopPhotoUrl = req.file ? `/uploads/${req.file.filename}` : "";
    const orderNumber = `SUN-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    const order = await ProjectOrder.create({
      orderNumber,
      projectType,
      projectTypeLabel: projectTypeLabel || projectType,
      customerName:     req.customer.fullName,
      customerMobile:   req.customer.mobile,
      customerEmail:    req.customer.email || '',
      customerId:       req.customer._id.toString(),
      systemSizeKW:     systemSizeKW     || 0,
      monthlyBillAmount:monthlyBillAmount || 0,
      estimatedSubsidy: estimatedSubsidy  || 0,
      totalProjectCost: totalProjectCost  || 0,
      state:            state || req.customer.state || 'Gujarat',
      country:          req.country || 'india',
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
      steps: (currentJourney?.steps || []).filter(s => s.enabled).map(s => ({
        stepId: s.id,
        stepNumber: s.stepNumber,
        title: s.title,
        assignedTo: s.assignedTo,
        status: "pending",
        isMandatory: s.isMandatory,
        pendingActionAlert: s.actionLabel || `Complete ${s.title}`,
      })),
      currentStepTitle: currentJourney?.steps?.[0]?.title || "Lead Captured",
    });

    // Link this project creation back to the BDE's Lead model if exists
    try {
      const LeadModel = (await import('../models/Lead.js')).default;
      await LeadModel.findOneAndUpdate(
        { mobile: req.customer.mobile },
        { 
          preferredInstallDate: preferredInstallDate || null,
          status: 'Converted',
          convertedProjectId: order._id,
        }
      );
    } catch (e) {
      console.error('Error linking project to lead:', e);
    }

    if (currentJourney?.signupToken?.enabled) {
      const amountInPaise = Math.round((currentJourney.signupToken.amount || 500) * 100);
      const options = {
        amount: amountInPaise,
        currency: "INR",
        receipt: `rcpt_${order._id}`,
      };
      const rzpOrder = await razorpay.orders.create(options);
      
      order.razorpayOrderId = rzpOrder.id;
      await order.save();

      return res.status(201).json({
        success: true,
        message: 'Payment required',
        requiresPayment: true,
        amount: options.amount / 100,
        razorpayOrderId: rzpOrder.id,
        key_id: process.env.RAZORPAY_KEY_ID,
        data: order,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      requiresPayment: false,
      data: order,
    });
  } catch (err) {
    console.error('applyForProject error:', err);
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
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found for this project' });

    if (enquiry.tokenPaid) {
      return res.status(400).json({ message: 'Token is already paid' });
    }

    // 1. Update Enquiry
    enquiry.tokenPaid = true;
    enquiry.tokenPaidAt = new Date();
    enquiry.status = 'Open For EPC';
    await enquiry.save();

    // 2. Update ProjectOrder Journey
    // We clear the pending alert and auto-complete the token step if any
    project.pendingActionAlert = '';
    project.pendingActionFor = 'company';
    if (project.steps && project.steps.length > 0) {
      const tStep = project.steps.find(s => s.title.toLowerCase().includes("token"));
      if (tStep && tStep.status === "pending") {
        tStep.status = "completed";
        tStep.completedAt = new Date();
        tStep.completedBy = "Customer";
        tStep.pendingActionAlert = "";
        
        // Mark next step as pending
        const idx = project.steps.findIndex(s => s.stepId === tStep.stepId);
        if (idx < project.steps.length - 1) {
          project.steps[idx + 1].status = "pending";
          project.steps[idx + 1].pendingActionAlert = "Awaiting EPC Assignment";
        }
      }
      
      const done = project.steps.filter((s) => s.status === "completed" || s.status === "skipped").length;
      project.completionPercentage = Math.round((done / project.steps.length) * 100);
    }
    
    await project.save();

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
      totalProjectValue: totalProjectCost || 0,
      payment90: {
        amount: totalProjectCost ? totalProjectCost * 0.9 : 0,
        status: 'Escrowed', // Since they paid escrow
      },
      payment10: {
        amount: totalProjectCost ? totalProjectCost * 0.1 : 0,
        status: 'Pending',
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
    const { state, district } = req.query;
    const { EpcPartner } = await import('../models/EpcPartner.js');
    
    // Find EPCs matching state and district (and must be verified/active)
    const epcs = await EpcPartner.find({
      isVerified: true,
      serviceAreas: {
        $elemMatch: {
          state: state || 'Gujarat',
          district: district
        }
      }
    }).select('companyName contactPerson totalExperience rating totalInstallations profilePic installerCount weeklyCapacityKw');

    // Also get fallback if no district match
    let finalEpcs = epcs;
    if (epcs.length === 0) {
      finalEpcs = await EpcPartner.find({
        isVerified: true,
        serviceAreas: {
          $elemMatch: {
            state: state || 'Gujarat'
          }
        }
      }).select('companyName contactPerson totalExperience rating totalInstallations profilePic installerCount weeklyCapacityKw');
    }

    res.json({ success: true, count: finalEpcs.length, data: finalEpcs });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
