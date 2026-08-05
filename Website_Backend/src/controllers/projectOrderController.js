import { ProjectOrder } from "../models/ProjectModel.js";
import { OrderJourneySettings } from "../models/OrderJourneySettings.js";
import EpcEnquiry from "../models/EpcEnquiry.js";
import Lead from "../models/Lead.js";
import EpcCalendar from "../models/EpcCalender.js";

import { calcCompletion, getStatusFromSteps, processStepCompletionEngine } from "../utils/stepEngine.js";

// ═══════════════════════════════════════════════════════════════════════════════
// CREATE NEW PROJECT ORDER (Lead creation)
// POST /api/project-orders
// ═══════════════════════════════════════════════════════════════════════════════
export const createProjectOrder = async (req, res) => {
  try {
    const {
      customerName, customerMobile, customerEmail,
      projectType, systemSizeKW, monthlyBillAmount,
      estimatedSubsidy, totalProjectCost, state,
      location, customerId,
    } = req.body;

    if (!customerName || !customerMobile || !projectType) {
      return res.status(400).json({
        success: false,
        message: "customerName, customerMobile aur projectType required hain",
      });
    }

    // Journey settings se steps fetch karo
    const journeySettings = await OrderJourneySettings.findOne({ _settingsKey: "main" });
    const journey = journeySettings?.journeys?.find(
      (j) => j.projectType === projectType && j.enabled
    );

    if (!journey) {
      return res.status(400).json({
        success: false,
        message: `${projectType} ke liye journey configure nahi ki gayi`,
      });
    }

    // Enabled steps se initial step completion records banao
    const { mapJourneyStepsToProjectSteps } = await import('../utils/stepEngine.js');
    const steps = mapJourneyStepsToProjectSteps(journey.steps);

    // First step auto-complete (Lead Captured)
    if (steps.length > 0) {
      steps[0].status = "completed";
      steps[0].completedAt = new Date();
      steps[0].completedBy = "system";
    }

    if (steps.length > 1) {
      steps[1].status = "in-progress";
      steps[1].startedAt = new Date();
    }

    const order = await ProjectOrder.create({
      customerName,
      customerMobile,
      customerEmail: customerEmail || "",
      customerId: customerId || null,
      projectType,
      projectTypeLabel: journey.projectTypeLabel,
      systemSizeKW: systemSizeKW || 0,
      monthlyBillAmount: monthlyBillAmount || 0,
      estimatedSubsidy: estimatedSubsidy || 0,
      totalProjectCost: totalProjectCost || 0,
      state: state || "Gujarat",
      location: location || {},
      steps,
      currentStepNumber: steps.length > 1 ? steps[1].stepNumber : 1,
      currentStepTitle: steps.length > 1 ? steps[1].title : steps[0]?.title || "",
      completionPercentage: calcCompletion(steps),
      pendingActionAlert: steps[1]?.pendingActionAlert || "",
      pendingActionFor: steps[1]?.assignedTo || "company",
      status: "Enquiry Created",
      lastActivityAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: `Project order created! Order: ${order.orderNumber}`,
      data: order,
    });
  } catch (err) {
    console.error("createProjectOrder error:", err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// GET ALL PROJECT ORDERS (Admin dashboard)
// GET /api/project-orders?status=in-progress&projectType=residential&page=1
// ═══════════════════════════════════════════════════════════════════════════════
export const getAllProjectOrders = async (req, res) => {
  try {
    const { status, projectType, country, district, city, assignedEPCId, search, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status && status !== 'All') filter.status = status;
    if (projectType && projectType !== 'All') filter.projectType = projectType;
    if (country && country !== 'All') filter.country = new RegExp(country, "i");
    if (district && district !== 'All') filter["location.district"] = new RegExp(district, "i");
    if (city && city !== 'All') filter["location.city"] = new RegExp(city, "i");
    if (assignedEPCId) filter.assignedEPCId = assignedEPCId;
    if (search) {
      filter.$or = [
        { customerName: new RegExp(search, "i") },
        { customerMobile: new RegExp(search, "i") },
        { orderNumber: new RegExp(search, "i") },
      ];
    }

    const total = await ProjectOrder.countDocuments(filter);
    const orders = await ProjectOrder.find(filter)
      .select("-notificationLog")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Summary stats
    const stats = await ProjectOrder.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: orders,
      stats: stats.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {}),
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// GET SINGLE PROJECT ORDER
// GET /api/project-orders/:id
// ═══════════════════════════════════════════════════════════════════════════════
export const getProjectOrder = async (req, res) => {
  try {
    const order = await ProjectOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order nahi mila" });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPLETE A STEP — Main logic
// POST /api/project-orders/:id/complete-step
// Body: { stepId, completedBy, evidenceUrl, evidenceNote }
// ═══════════════════════════════════════════════════════════════════════════════
export const completeStep = async (req, res) => {
  try {
    const { stepId, completedBy = "Admin", note = "", evidenceNote = "" } = req.body;
    
    const finalNote = evidenceNote || note || "";
    let finalUrl = req.body.evidenceUrl || "";
    if (req.file) {
      finalUrl = `/${req.file.path.replace(/\\/g, '/')}`;
    }

    const order = await ProjectOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order nahi mila" });

    const result = await processStepCompletionEngine(order, stepId, completedBy, finalUrl, finalNote);

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    await result.order.save();

    res.json({
      success: true,
      message: result.message,
      data: {
        orderNumber: result.order.orderNumber,
        completionPercentage: result.order.completionPercentage,
        currentStepNumber: result.order.currentStepNumber,
        currentStepTitle: result.order.currentStepTitle,
        status: result.order.status,
        pendingActionAlert: result.order.pendingActionAlert,
        pendingActionFor: result.order.pendingActionFor,
        nextStep: result.nextStep ? { stepId: result.nextStep.stepId, title: result.nextStep.title, assignedTo: result.nextStep.assignedTo } : null,
      },
    });
  } catch (err) {
    console.error("completeStep error:", err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// APPROVE STEP (Admin Only)
// POST /api/project-orders/:id/steps/:stepId/approve
// ═══════════════════════════════════════════════════════════════════════════════
export const approveStep = async (req, res) => {
  try {
    const { id, stepId } = req.params;
    const order = await ProjectOrder.findById(id);
    if (!order) return res.status(404).json({ success: false, message: "Order nahi mila" });

    const stepIndex = order.steps.findIndex((s) => s.stepId === stepId);
    if (stepIndex === -1) return res.status(404).json({ success: false, message: "Step nahi mila" });

    order.steps[stepIndex].status = "completed";
    order.steps[stepIndex].completedBy = "Admin";
    order.steps[stepIndex].completedAt = new Date();
    order.steps[stepIndex].pendingActionAlert = "";

    // Activate next step
    const nextStep = order.steps.find((s, i) => i > stepIndex && s.status === "pending");
    if (nextStep) {
      const nextStepIndex = order.steps.findIndex(s => s.stepId === nextStep.stepId);
      if (nextStepIndex !== -1) {
        order.steps[nextStepIndex].status = "in-progress";
        order.steps[nextStepIndex].startedAt = new Date();
      }
      order.currentStepNumber = nextStep.stepNumber;
      order.currentStepTitle = nextStep.title;
      order.pendingActionAlert = nextStep.pendingActionAlert || `${nextStep.title} complete karo`;
      order.pendingActionFor = nextStep.assignedTo;
    } else {
      order.status = "completed";
      order.completionPercentage = 100;
      order.pendingActionAlert = "";
      order.pendingActionFor = "none";
    }

    order.completionPercentage = calcCompletion(order.steps);
    
    await order.save();
    res.json({ success: true, message: "Step approved successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// REJECT STEP (Admin Only - Revert to in-progress)
// POST /api/project-orders/:id/steps/:stepId/reject
// ═══════════════════════════════════════════════════════════════════════════════
export const rejectStep = async (req, res) => {
  try {
    const { id, stepId } = req.params;
    const order = await ProjectOrder.findById(id);
    if (!order) return res.status(404).json({ success: false, message: "Order nahi mila" });

    const stepIndex = order.steps.findIndex((s) => s.stepId === stepId);
    if (stepIndex === -1) return res.status(404).json({ success: false, message: "Step nahi mila" });

    order.steps[stepIndex].status = "in-progress";
    order.steps[stepIndex].evidenceUrl = ""; // Clear evidence if desired
    order.steps[stepIndex].pendingActionAlert = `Admin rejected previous upload. Re-upload required.`;
    
    order.pendingActionAlert = `${order.steps[stepIndex].title} needs to be re-done`;
    order.pendingActionFor = order.steps[stepIndex].assignedTo;
    
    await order.save();
    res.json({ success: true, message: "Step rejected and reverted to in-progress" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// UPDATE GEO LOCATION
// PUT /api/project-orders/:id/location
// ═══════════════════════════════════════════════════════════════════════════════
export const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude, address, district, taluka, pincode, city, state, captureMethod } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: "Latitude aur longitude required hain" });
    }

    const updated = await ProjectOrder.findByIdAndUpdate(
      req.params.id,
      {
        location: {
          latitude, longitude, address: address || "",
          district: district || "", taluka: taluka || "",
          pincode: pincode || "", city: city || "",
          state: state || "Gujarat",
          capturedAt: new Date(),
          captureMethod: captureMethod || "manual",
        },
        lastActivityAt: new Date(),
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: "Order nahi mila" });

    res.json({
      success: true,
      message: "Location updated!",
      data: { orderNumber: updated.orderNumber, location: updated.location },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ASSIGN EPC PARTNER
// PUT /api/project-orders/:id/assign-epc
// ═══════════════════════════════════════════════════════════════════════════════
export const assignEPC = async (req, res) => {
  try {
    const { epcId, epcName } = req.body;

    const updated = await ProjectOrder.findByIdAndUpdate(
      req.params.id,
      { assignedEPCId: epcId, assignedEPCName: epcName, lastActivityAt: new Date() },
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: "Order nahi mila" });

    res.json({
      success: true,
      message: `${epcName} assigned to order ${updated.orderNumber}`,
      data: updated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// GET PENDING ACTIONS (for admin dashboard alerts)
// GET /api/project-orders/pending-actions
// ═══════════════════════════════════════════════════════════════════════════════
export const getPendingActions = async (req, res) => {
  try {
    const pendingOrders = await ProjectOrder.find({
      status: { $nin: ["closed", "cancelled"] },
      pendingActionAlert: { $ne: "" },
    })
      .select("orderNumber customerName projectType currentStepTitle pendingActionAlert pendingActionFor completionPercentage lastActivityAt")
      .sort({ lastActivityAt: 1 }) // oldest first
      .limit(50);

    res.json({
      success: true,
      count: pendingOrders.length,
      data: pendingOrders,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// UPDATE ORDER (admin edit)
// PUT /api/project-orders/:id
// ═══════════════════════════════════════════════════════════════════════════════
export const updateProjectOrder = async (req, res) => {
  try {
    const { steps, ...safeUpdates } = req.body; // steps alag se handle karo

    const updated = await ProjectOrder.findByIdAndUpdate(
      req.params.id,
      { $set: { ...safeUpdates, lastActivityAt: new Date() } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: "Order nahi mila" });

    res.json({ success: true, message: "Order updated!", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// GET ORDER JOURNEY STATUS (for customer portal / frontend)
// GET /api/project-orders/:id/journey-status
// ═══════════════════════════════════════════════════════════════════════════════
export const getJourneyStatus = async (req, res) => {
  try {
    const order = await ProjectOrder.findById(req.params.id).select(
      "orderNumber customerName projectType projectTypeLabel status completionPercentage currentStepNumber currentStepTitle steps pendingActionAlert location assignedEPCName"
    );

    if (!order) return res.status(404).json({ success: false, message: "Order nahi mila" });

    // Customer-safe steps (no internal notes)
    const publicSteps = order.steps.map((s) => ({
      stepNumber: s.stepNumber,
      title: s.title,
      status: s.status,
      completedAt: s.completedAt,
      assignedTo: s.assignedTo,
    }));

    res.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        projectType: order.projectTypeLabel,
        status: order.status,
        completionPercentage: order.completionPercentage,
        currentStep: {
          number: order.currentStepNumber,
          title: order.currentStepTitle,
        },
        pendingAction: order.pendingActionAlert,
        location: order.location,
        assignedEPC: order.assignedEPCName,
        steps: publicSteps,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// GET DASHBOARD STATS
// GET /api/project-orders/stats
// ═══════════════════════════════════════════════════════════════════════════════
export const getProjectOrderStats = async (req, res) => {
  try {
    const [statusStats, typeStats, totalOrders, avgCompletion] = await Promise.all([
      ProjectOrder.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      ProjectOrder.aggregate([{ $group: { _id: "$projectType", count: { $sum: 1 } } }]),
      ProjectOrder.countDocuments(),
      ProjectOrder.aggregate([{ $group: { _id: null, avg: { $avg: "$completionPercentage" } } }]),
    ]);

    res.json({
      success: true,
      data: {
        total: totalOrders,
        avgCompletion: Math.round(avgCompletion[0]?.avg || 0),
        byStatus: statusStats.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {}),
        byType: typeStats.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {}),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// QUALIFY PROJECT ORDER (Admin approves Lead, triggers Token payment)
// POST /api/project-orders/:id/qualify
// ═══════════════════════════════════════════════════════════════════════════════
export const qualifyProjectOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await ProjectOrder.findById(id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    // Update ProjectOrder status
    order.status = "qualified";
    
    // Auto complete qualification step if it exists
    if (order.steps && order.steps.length > 0) {
      const qStep = order.steps.find(s => s.title.toLowerCase().includes("qualification"));
      if (qStep && qStep.status === "pending") {
        qStep.status = "completed";
        qStep.completedAt = new Date();
        qStep.completedBy = "Admin";
        qStep.pendingActionAlert = "";
        
        // Mark next step as pending
        const idx = order.steps.findIndex(s => s.stepId === qStep.stepId);
        if (idx < order.steps.length - 1) {
          order.steps[idx + 1].status = "pending";
          order.steps[idx + 1].pendingActionAlert = "Awaiting Token Payment";
        }
      }
      order.completionPercentage = calcCompletion(order.steps);
    }
    await order.save();

    // Map project type to EpcEnquiry enum
    const pTypeMap = {
      "surya-ghar": "Surya Ghar Yojana",
      "residential": "Residential Solar",
      "commercial": "Commercial Solar",
      "group": "Group Solar"
    };
    const mappedType = pTypeMap[order.projectType] || "Residential Solar";

    // Create EPC Enquiry with Token amount
    const kw = order.systemSizeKW || 1;
    const tokenAmt = kw * 2000;

    const existingEnquiry = await EpcEnquiry.findOne({ orderNumber: order.orderNumber });
    if (!existingEnquiry) {
      const enquiry = new EpcEnquiry({
      customerName: order.customerName,
      customerMobile: order.customerMobile,
      customerEmail: order.customerEmail || "",
      enquiryType: 'ECommerce',
      projectType: mappedType,
      systemCapacityKw: order.systemSizeKW,
      state: order.state || order.location?.state || "",
      district: order.location?.city || "",
      city: order.location?.city || "",
      address: order.location?.address || "",
      rooftopPhoto: order.rooftopPhoto || "",
      geolocation: {
        latitude: order.latitude,
        longitude: order.longitude
      },
      preferredInstallDate: order.preferredInstallDate,
      tokenAmount: tokenAmt,
      tokenPaid: false,
      status: 'Lead',
      assignmentType: 'FirstComeFirstServe',
      orderNumber: order.orderNumber
    });

    await enquiry.save();
    }
    res.json({ success: true, message: "Lead qualified successfully. Awaiting token payment." });
  } catch (error) {
    console.error("qualifyProjectOrder Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const confirmInstallDate = async (req, res) => {
  try {
    const projectOrder = await ProjectOrder.findById(req.params.id);
    if (!projectOrder) return res.status(404).json({ success: false, message: 'Order not found' });
    
    const { epcCalendarSlotId, preferredDate } = req.body || {};
    
    if (epcCalendarSlotId) {
      const slot = await EpcCalendar.findById(epcCalendarSlotId).populate('epcPartner');
      if (slot && !slot.isBlocked && slot.currentBookings < slot.maxBookings) {
        slot.currentBookings += 1;
        if (slot.currentBookings >= slot.maxBookings) slot.isBlocked = true;
        await slot.save();
        
        projectOrder.assignedEPCId = (slot.epcPartner?._id || slot.epcPartner).toString();
        projectOrder.assignedEPCName = slot.epcPartner?.companyName || "";
        projectOrder.preferredInstallDate = slot.date;
      }
    } else if (preferredDate) {
      projectOrder.preferredInstallDate = new Date(preferredDate);
    }

    projectOrder.isInstallDateFixed = true;
    projectOrder.pendingActionAlert = `🎉 Installation date confirmed & locked for ${new Date(projectOrder.preferredInstallDate).toLocaleDateString("en-IN")} with ${projectOrder.assignedEPCName || 'certified EPC installer'}!`;
    projectOrder.pendingActionFor = 'none';
    await projectOrder.save();
    
    // Also update Lead model
    await Lead.updateOne(
      { $or: [{ convertedProjectId: projectOrder._id }, { mobile: projectOrder.customerMobile }] },
      { isInstallDateFixed: true, preferredInstallDate: projectOrder.preferredInstallDate, status: 'Converted' }
    );

    // Create In-App Bell Notifications
    try {
      const Notification = (await import('../models/Notification.js')).default;
      
      // Customer Notification
      let targetCustId = projectOrder.customerId;
      if (!targetCustId && projectOrder.customerMobile) {
        try {
          const { default: CustomerModel } = await import('../models/CustomerModel.js');
          const foundCust = await CustomerModel.findOne({ mobile: projectOrder.customerMobile });
          if (foundCust) targetCustId = foundCust._id.toString();
        } catch (cErr) { console.error('Customer lookup error:', cErr); }
      }

      await Notification.create({
        role: 'Customer',
        recipientId: targetCustId || null,
        title: '🎉 Solar Installation Date Confirmed!',
        message: `Your solar installation for ${projectOrder.orderNumber} is officially confirmed for ${new Date(projectOrder.preferredInstallDate).toLocaleDateString("en-IN")} with ${projectOrder.assignedEPCName || 'your certified EPC installer'}.`,
        projectId: projectOrder._id
      });

      // EPC Partner Notification
      if (projectOrder.assignedEPCId) {
        await Notification.create({
          role: 'EpcPartner',
          recipientId: projectOrder.assignedEPCId,
          title: '⚡ Installation Order Confirmed & Locked!',
          message: `Order #${projectOrder.orderNumber} for ${projectOrder.customerName} is scheduled for installation on ${new Date(projectOrder.preferredInstallDate).toLocaleDateString("en-IN")}.`,
          projectId: projectOrder._id
        });
      }

      // Admin Notification
      await Notification.create({
        role: 'Admin',
        title: `✅ Installation Confirmed for Order #${projectOrder.orderNumber}`,
        message: `BDE & EPC confirmed installation for ${projectOrder.customerName} on ${new Date(projectOrder.preferredInstallDate).toLocaleDateString("en-IN")}.`,
        projectId: projectOrder._id
      });
    } catch (notifErr) {
      console.error('Notification creation error:', notifErr);
    }

    // Trigger SMS & Email Notifications
    const dateFormatted = new Date(projectOrder.preferredInstallDate).toLocaleDateString("en-IN");
    try {
      const { sendNotificationSMS } = await import('../utils/smsService.js');
      
      // Customer SMS/Email
      await sendNotificationSMS(
        projectOrder.customerMobile, 
        `Dear ${projectOrder.customerName}, your solar installation with ${projectOrder.assignedEPCName || 'Sunnovative EPC Partner'} is CONFIRMED for ${dateFormatted}. Thank you for choosing Sunnovative!`
      );

      // EPC Partner SMS/Email
      if (projectOrder.assignedEPCId) {
        await sendNotificationSMS(
          projectOrder.assignedEPCId,
          `Attention EPC Partner (${projectOrder.assignedEPCName}), Order #${projectOrder.orderNumber} for ${projectOrder.customerName} is CONFIRMED to be installed on ${dateFormatted}.`
        );
      }
    } catch (smsErr) {
      console.error('SMS/Email dispatch error:', smsErr);
    }
    
    res.json({ success: true, message: 'Installation date confirmed and notifications sent successfully!' });
  } catch (error) {
    console.error("confirmInstallDate error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStcStatus = async (req, res) => {
  try {
    const { action, amountRecovered } = req.body;
    const order = await ProjectOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    
    if (action === "mark-stcs-created") {
      order.stcStatus.stcsCreatedInRegistry = true;
      order.stcStatus.stcsCreatedDate = new Date();
    } else if (action === "mark-stcs-traded") {
      order.stcStatus.stcsTraded = true;
      order.stcStatus.stcsTradedDate = new Date();
    } else if (action === "update-amount") {
      order.stcStatus.amountRecovered = Number(amountRecovered) || 0;
    }
    
    await order.save();
    res.json({ success: true, message: "STC status updated", stcStatus: order.stcStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── Admin Add Note ─────────────────────────────────────────────────────────────
export const addAdminNote = async (req, res) => {
  try {
    const { id, stepId } = req.params;
    const { note, adminName } = req.body;
    const order = await ProjectOrder.findById(id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const { addAdminNoteToStep } = await import('../utils/stepEngine.js');
    const result = await addAdminNoteToStep(order, stepId, note, adminName || "Admin");
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin Request Reupload ─────────────────────────────────────────────────────
export const requestReupload = async (req, res) => {
  try {
    const { id, stepId } = req.params;
    const { reason, adminName } = req.body;
    const order = await ProjectOrder.findById(id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const { requestStepReupload } = await import('../utils/stepEngine.js');
    const result = await requestStepReupload(order, stepId, reason || "Document quality issue", adminName || "Admin");
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── BDE Complete on Behalf of Customer ─────────────────────────────────────────
export const completeStepOnBehalf = async (req, res) => {
  try {
    const { id, stepId } = req.params;
    const { bdeName, evidenceUrl, note } = req.body;
    const order = await ProjectOrder.findById(id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const { completeStepOnBehalfOfCustomer } = await import('../utils/stepEngine.js');
    const result = await completeStepOnBehalfOfCustomer(order, stepId, bdeName || "BDE", evidenceUrl || "", note || "");
    if (result.success) await order.save();
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── EPC Payout Flow ────────────────────────────────────────────────────────────
export const shareEpcPayoutQr = async (req, res) => {
  try {
    const { percentage, qrCodeUrl } = req.body;
    const order = await ProjectOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const total = order.totalProjectCost || 0;
    const pct = percentage || 90;
    order.epcPayout = {
      percentage: pct,
      amount: Math.round((total * pct) / 100),
      qrCodeUrl: qrCodeUrl || "",
      status: "qr-shared",
      epcProofUrl: "",
      epcMarkedAt: null,
      adminConfirmedAt: null,
    };

    await order.save();
    res.json({ success: true, message: "EPC Payout QR shared", epcPayout: order.epcPayout });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const markEpcPayoutReceived = async (req, res) => {
  try {
    const { proofUrl } = req.body;
    const order = await ProjectOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (!order.epcPayout) order.epcPayout = {};
    order.epcPayout.status = "epc-marked-received";
    order.epcPayout.epcProofUrl = proofUrl || "";
    order.epcPayout.epcMarkedAt = new Date();

    await order.save();
    res.json({ success: true, message: "EPC marked payment received", epcPayout: order.epcPayout });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const confirmEpcPayout = async (req, res) => {
  try {
    const order = await ProjectOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (!order.epcPayout) order.epcPayout = {};
    order.epcPayout.status = "admin-confirmed";
    order.epcPayout.adminConfirmedAt = new Date();

    await order.save();
    res.json({ success: true, message: "Admin confirmed EPC payment payout", epcPayout: order.epcPayout });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};