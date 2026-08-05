
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
    }).populate("recommendedEpcs", "companyName rating totalInstallations contactPerson city state activeDistricts").lean();
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
      steps: await (async () => {
        const { mapJourneyStepsToProjectSteps } = await import('../utils/stepEngine.js');
        return mapJourneyStepsToProjectSteps(currentJourney?.steps || []);
      })(),
      currentStepTitle: currentJourney?.steps?.[0]?.title || "Lead Captured",
    });

    // Link this project creation back to the BDE's Lead model if exists
    try {
      const LeadModel = (await import('../models/Lead.js')).default;
      const cleanMobile = req.customer.mobile.replace(/\D/g, '').slice(-10);
      const mobileRegex = new RegExp(cleanMobile + '$', 'i');

      const updatedLead = await LeadModel.findOneAndUpdate(
        { $or: [{ mobile: req.customer.mobile }, { mobile: mobileRegex }, { customerId: req.customer._id }] },
        { 
          preferredInstallDate: preferredInstallDate ? new Date(preferredInstallDate) : null,
          consumerNumber: payload.consumerNumber || undefined,
          rooftopPhoto: rooftopPhotoUrl || undefined,
          kw: systemSizeKW || undefined,
          solarType: projectType || undefined,
          billAmount: monthlyBillAmount || undefined,
          convertedProjectId: order._id,
        },
        { new: true }
      );
      console.log(`[Sync] Successfully updated Lead (${updatedLead?._id}) with preferredInstallDate: ${preferredInstallDate}`);
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

// -- POST /api/customer/projects/:id/complete-step -- Complete a customer assigned step --
export const completeStep = async (req, res) => {
  try {
    const { stepId, note } = req.body;
    
    const project = await ProjectOrder.findOne({
      _id: req.params.id,
      customer: req.customer._id,
    });
    
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const stepIndex = project.steps.findIndex(s => s.stepId === stepId);
    if (stepIndex === -1) return res.status(404).json({ message: 'Step not found' });
    
    if (project.steps[stepIndex].assignedTo !== 'customer') {
      return res.status(403).json({ message: 'Not authorized to complete this step. It is assigned to ' + project.steps[stepIndex].assignedTo });
    }

    project.steps[stepIndex].status = 'completed';
    project.steps[stepIndex].completedAt = new Date();
    project.steps[stepIndex].completedBy = req.customer.name || 'Customer';
    
    if (note) project.steps[stepIndex].evidenceNote = note;
    
    if (req.file) {
      project.steps[stepIndex].evidenceUrl = `/${req.file.path.replace(/\\/g, '/')}`;
    }

    // Update overall current step
    const nextStep = project.steps.find(s => s.status !== 'completed');
    if (nextStep) {
      project.currentStepNumber = nextStep.stepNumber;
      project.status = nextStep.title;
      nextStep.status = 'in-progress';
    } else {
      project.status = 'Project Completed';
      project.completionPercentage = 100;
    }

    // Recalculate completion percentage
    const completedStepsCount = project.steps.filter(s => s.status === 'completed').length;
    project.completionPercentage = Math.round((completedStepsCount / project.steps.length) * 100);

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


export const acceptEpcRecommendation = async (req, res) => {
  try {
    const { epcId, epcName } = req.body;
    
    // Find project flexibly matching customerId or mobile
    const project = await ProjectOrder.findOne({
      _id: req.params.id,
      $or: [
        { customerId: req.customer._id.toString() },
        { customerMobile: req.customer.mobile }
      ]
    });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const { default: EpcPartner } = await import('../models/EpcPartner.js');
    const epc = await EpcPartner.findById(epcId);
    
    project.assignedEPCId = epcId;
    project.assignedEPCName = epcName || epc?.companyName || "Australian Certified Installer";
    project.bdeRecommendationStatus = 'accepted';
    project.status = 'EPC Accepted';
    project.pendingActionAlert = 'Installer accepted! BDE will now lock your installation date.';
    project.pendingActionFor = 'bde';
    await project.save();

    // Sync Lead model
    try {
      const LeadModel = (await import('../models/Lead.js')).default;
      await LeadModel.updateOne(
        { $or: [{ convertedProjectId: project._id }, { mobile: project.customerMobile }] },
        { 
          assignedEPCId: epcId, 
          assignedEPCName: project.assignedEPCName, 
          enquiryStatus: 'EPC Accepted',
          epcDetails: {
            companyName: project.assignedEPCName,
            contactPerson: epc?.ownerName || epc?.contactPerson || "Installer Representative",
            mobile: epc?.mobile || epc?.phone || "0412345671",
            email: epc?.email || "",
            rating: epc?.rating || 4.9
          }
        }
      );
    } catch (lErr) {
      console.error('Lead update error:', lErr);
    }

    // Trigger Notification for BDE
    try {
      const Notification = (await import('../models/Notification.js')).default;
      await Notification.create({
        role: 'BDE',
        recipientId: project.assignedBde ? project.assignedBde : null,
        title: '⚡ Customer Accepted EPC Installer!',
        message: `Customer ${project.customerName} has accepted ${project.assignedEPCName}. Please confirm and lock the final installation date!`,
        projectId: project._id
      });
    } catch (nErr) {
      console.error('Notification error:', nErr);
    }

    res.json({ success: true, project, message: `Successfully accepted ${project.assignedEPCName}!` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectEpcRecommendations = async (req, res) => {
  try {
    const project = await ProjectOrder.findOneAndUpdate(
      { _id: req.params.id, customerId: req.customer._id.toString() },
      { bdeRecommendationStatus: 'rejected' },
      { new: true }
    );
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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







