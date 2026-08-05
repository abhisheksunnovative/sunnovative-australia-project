import { BDE } from "../models/BDEModel.js";
import Lead from "../models/Lead.js";
import { ProjectOrder } from "../models/ProjectModel.js";

// ==============================
// Admin Management (BDE CRUD)
// ==============================

export const createBDE = async (req, res) => {
  try {
    const bde = new BDE(req.body);
    await bde.save();
    res.status(201).json({ success: true, bde });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllBDEs = async (req, res) => {
  try {
    const bdes = await BDE.find().select("-password");
    res.json({ success: true, bdes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBDEById = async (req, res) => {
  try {
    const bde = await BDE.findById(req.params.id).select("-password");
    if (!bde) return res.status(404).json({ success: false, message: "BDE not found" });
    res.json({ success: true, bde });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBDE = async (req, res) => {
  try {
    const bde = await BDE.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-password");
    if (!bde) return res.status(404).json({ success: false, message: "BDE not found" });
    res.json({ success: true, bde });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteBDE = async (req, res) => {
  try {
    const bde = await BDE.findByIdAndDelete(req.params.id);
    if (!bde) return res.status(404).json({ success: false, message: "BDE not found" });
    res.json({ success: true, message: "BDE deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ==============================
// BDE Portal Authentication
// ==============================

export const bdeLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const bde = await BDE.findOne({ email, isActive: true });
    
    if (!bde || bde.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid credentials or account inactive" });
    }
    
    // Simplistic auth token approach for the example
    res.json({ success: true, bde: { _id: bde._id, name: bde.name, email: bde.email }, token: bde._id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ==============================
// BDE Portal Features
// ==============================

export const getBDEDashboard = async (req, res) => {
  try {
    const bdeId = req.params.bdeId;
    const bde = await BDE.findById(bdeId);
    if (!bde) return res.status(404).json({ success: false, message: "BDE not found" });

    const totalAssigned = await Lead.countDocuments({ assignedBde: bdeId });
    const activeCustomers = await Lead.countDocuments({ assignedBde: bdeId, status: "Contacted" });
    const ordersGenerated = await Lead.countDocuments({ assignedBde: bdeId, status: "Converted" });
    const conversionRatio = totalAssigned > 0 ? ((ordersGenerated / totalAssigned) * 100).toFixed(2) : 0;
    
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    
    const todaysFollowupLeads = await Lead.find({ 
      assignedBde: bdeId, 
      nextFollowUp: { $gte: startOfToday, $lte: endOfToday }
    });

    const districtStats = await Lead.aggregate([
      { $match: { assignedBde: bdeId, status: { $ne: 'Converted' } } },
      { $group: { _id: "$district", count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalAssigned,
        activeCustomers,
        ordersGenerated,
        conversionRatio,
        todaysFollowups: todaysFollowupLeads.length,
        followupList: todaysFollowupLeads,
        districtStats,
        targetLeads: bde.targets?.leads || 0,
        targetConversions: bde.targets?.conversions || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

import EpcEnquiry from '../models/EpcEnquiry.js';

export const getBDELeads = async (req, res) => {
  try {
    const leads = await Lead.find({ assignedBde: req.params.bdeId }).sort({ createdAt: -1 }).lean();
    
    for (let lead of leads) {
      if (lead.convertedProjectId) {
        const po = await ProjectOrder.findById(lead.convertedProjectId);
        if (po) {
          const enquiry = await EpcEnquiry.findOne({ orderNumber: po.orderNumber }).populate('epcPartner', 'companyName contactPerson mobile email');
          if (enquiry && enquiry.epcPartner) {
            lead.epcDetails = enquiry.epcPartner;
            lead.enquiryStatus = enquiry.status;
          }
        }
      }
    }
    
    res.json({ success: true, leads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDemandPool = async (req, res) => {
  try {
    const bde = await BDE.findById(req.params.bdeId);
    if (!bde) return res.status(404).json({ success: false, message: "BDE not found" });
    
    // Strict requirement: BDE must match country AND district of the lead
    if (!bde.assignedCountries || bde.assignedCountries.length === 0 || 
        !bde.assignedDistricts || bde.assignedDistricts.length === 0) {
      return res.json({ success: true, leads: [] });
    }

    let query = { assignedBde: null };

    // Country Condition (AND)
    const countryRegexes = bde.assignedCountries
      .filter(t => t.trim())
      .map(t => new RegExp('^' + t.trim() + '$', 'i'));
    if (countryRegexes.length > 0) {
      query.country = { $in: countryRegexes };
    }

    // District Condition (AND)
    const distRegexes = bde.assignedDistricts
      .filter(t => t.trim())
      .map(t => new RegExp('^' + t.trim() + '$', 'i'));
    if (distRegexes.length > 0) {
      query.district = { $in: distRegexes };
    }

    const demandLeads = await Lead.find(query).limit(100);
    res.json({ success: true, leads: demandLeads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const assignLeadToBDE = async (req, res) => {
  try {
    const { leadId, bdeId } = req.body;
    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
    if (lead.assignedBde) return res.status(400).json({ success: false, message: "Lead already assigned" });

    lead.assignedBde = bdeId;
    lead.history.push({ action: "Assigned to BDE", date: new Date() });
    await lead.save();
    
    res.json({ success: true, lead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBDELead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.leadId);
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
    
    if (req.body.nextFollowUp) lead.nextFollowUp = req.body.nextFollowUp;
    if (req.body.status) lead.status = req.body.status;
    if (req.body.notes) {
      lead.notes = req.body.notes;
      lead.history.push({ action: "BDE Followup: " + req.body.notes, date: new Date() });
    }

    await lead.save();
    res.json({ success: true, lead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================
// Additional BDE Features
// ==============================

export const createBDELead = async (req, res) => {
  try {
    const bdeId = req.params.bdeId;
    const leadData = {
      ...req.body,
      assignedBde: bdeId,
      status: 'New',
      history: [{ action: "Manually created by BDE", date: new Date() }]
    };
    
    const lead = new Lead(leadData);
    await lead.save();
    res.status(201).json({ success: true, lead });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateBDELeadDetails = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.leadId);
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
    
    const updates = ['name', 'mobile', 'email', 'district', 'state', 'pincode', 'kw', 'billAmount', 'solarType', 'notes', 'consumerNumber', 'discom', 'tariff', 'meterCategory'];
    updates.forEach(field => {
      if (req.body[field] !== undefined) {
        lead[field] = req.body[field];
      }
    });

    lead.history.push({ action: "Lead details updated manually", date: new Date() });
    await lead.save();
    res.json({ success: true, lead });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getBDEProjects = async (req, res) => {
  try {
    const bdeId = req.params.bdeId;
    const { country, state, district, projectType, search, status } = req.query;

    let filter = { assignedBde: bdeId };
    if (country) filter.country = country;
    if (state) filter.state = state;
    if (district) filter.district = district;
    if (projectType) filter.projectType = projectType;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { customerMobile: { $regex: search, $options: 'i' } },
        { orderNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const projects = await ProjectOrder.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBDEOverdueProjects = async (req, res) => {
  try {
    const bdeId = req.params.bdeId;
    const projects = await ProjectOrder.find({ 
      assignedBde: bdeId,
      hasOverdueSteps: true,
      status: { $nin: ["Project Completed", "cancelled", "closed", "Warranty Activated"] }
    }).sort({ createdAt: -1 });
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadBDEProjectDoc = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "File is required" });
    
    const { projectId, stepId } = req.params;
    const project = await ProjectOrder.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    const stepIndex = project.steps.findIndex(s => s.stepId === stepId);
    if (stepIndex === -1) return res.status(404).json({ success: false, message: "Step not found" });

    // Mock upload URL - in production use S3/Cloudinary
    const fileUrl = `/uploads/bde-docs/${Date.now()}-${req.file.originalname}`;
    
    project.steps[stepIndex].evidenceUrl = fileUrl;
    
    // Use the shared helper to advance the journey correctly
    const { processStepCompletionEngine } = await import('../utils/stepEngine.js');
    const result = await processStepCompletionEngine(project, stepId, 'BDE', fileUrl, null, "bde");
    
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }
    
    await project.save();
    
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

import EpcCalendar from '../models/EpcCalender.js';

export const requestBdeOtp = async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier) return res.status(400).json({ success: false, message: 'Email or Mobile required' });
    const bde = await BDE.findOne({ $or: [{ email: identifier.toLowerCase() }, { mobile: identifier }] });
    if (!bde) return res.status(404).json({ success: false, message: 'BDE not found' });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    bde.otp = otp;
    bde.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await bde.save();
    console.log('OTP:', otp);
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyOtpAndSetPassword = async (req, res) => {
  try {
    const { identifier, otp, newPassword } = req.body;
    const bde = await BDE.findOne({ $or: [{ email: identifier.toLowerCase() }, { mobile: identifier }] });
    if (!bde) return res.status(404).json({ success: false, message: 'BDE not found' });
    if (bde.otp !== otp || bde.otpExpires < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
    bde.password = newPassword;
    bde.otp = null;
    bde.otpExpires = null;
    await bde.save();
    res.json({ success: true, message: 'Password set successfully', bdeId: bde._id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEpcCalendarForBde = async (req, res) => {
  try {
    const { district, projectType } = req.query;
    if (!district || !projectType) return res.status(400).json({ success: false, message: 'District and projectType are required' });
    const today = new Date();
    today.setHours(0,0,0,0);
    const slots = await EpcCalendar.find({ district, projectType, date: { $gte: today } }).populate('epcPartner', 'companyName contactPerson mobile email').sort({ date: 1 });
    res.json({ success: true, slots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const recommendEpcs = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { epcIds } = req.body;
    if (!epcIds || !Array.isArray(epcIds) || epcIds.length === 0 || epcIds.length > 5) {
      return res.status(400).json({ success: false, message: 'Please provide between 1 and 5 EPC IDs' });
    }
    const project = await ProjectOrder.findByIdAndUpdate(
      projectId,
      { recommendedEpcs: epcIds, bdeRecommendationStatus: 'pending', pendingActionAlert: 'Review recommended EPC installers', pendingActionFor: 'customer' },
      { new: true }
    );
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

