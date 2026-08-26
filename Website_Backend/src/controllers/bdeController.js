import axios from "axios";
import { BDE } from "../models/BDEModel.js";
import Lead from "../models/Lead.js";
import { ProjectOrder } from "../models/ProjectModel.js";

// ==============================
// Admin Management (BDE CRUD)
// ==============================

export const createBDE = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.assignedCountries && payload.assignedCountries.length > 0) {
      payload.country = payload.assignedCountries[0].toLowerCase();
    } else if (payload.country) {
      payload.assignedCountries = [payload.country.toLowerCase()];
    }
    if (payload.assignedRegions && payload.assignedRegions.length > 0) {
      payload.region = payload.assignedRegions[0];
    }
    const bde = new BDE(payload);
    await bde.save();
    res.status(201).json({ success: true, bde });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllBDEs = async (req, res) => {
  try {
    const { country } = req.query;
    let query = {};
    if (country) {
      // BDEs can have an array of assignedCountries or a single country field
      query = {
        $or: [
          { assignedCountries: country.toLowerCase() },
          { country: { $regex: new RegExp(`^${country}$`, 'i') } }
        ]
      };
    }
    const bdes = await BDE.find(query).select("-password");
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
    const payload = { ...req.body };
    if (payload.assignedCountries && payload.assignedCountries.length > 0) {
      payload.country = payload.assignedCountries[0].toLowerCase();
    }
    if (payload.assignedRegions && payload.assignedRegions.length > 0) {
      payload.region = payload.assignedRegions[0];
    }
    const bde = await BDE.findByIdAndUpdate(req.params.id, payload, { new: true }).select("-password");
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
// BDE Onboarding Documents
// ==============================

// BDE uploads a doc from My Profile page
export const uploadOnboardingDoc = async (req, res) => {
  try {
    const { id } = req.params;        // bdeId
    const { docName } = req.body;
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

    const fileUrl = `/uploads/bde-docs/${req.file.filename}`;
    const bde = await BDE.findById(id);
    if (!bde) return res.status(404).json({ success: false, message: "BDE not found" });

    // Upsert: if same docName exists, replace it; otherwise add new
    const existingIdx = bde.onboardingDocs.findIndex(d => d.docName === docName);
    if (existingIdx !== -1) {
      bde.onboardingDocs[existingIdx].fileUrl = fileUrl;
      bde.onboardingDocs[existingIdx].verified = false; // reset approval on re-upload
      bde.onboardingDocs[existingIdx].uploadedAt = new Date();
    } else {
      bde.onboardingDocs.push({ docName, fileUrl, verified: false, uploadedAt: new Date() });
    }
    await bde.save();

    // Trigger Notification for Admin
    try {
      const Notification = (await import('../models/Notification.js')).default;
      await Notification.create({
        role: 'Admin',
        title: 'New BDE Document Uploaded',
        message: `${bde.name} uploaded ${docName}. Review required.`,
        type: 'document_upload',
        relatedTab: 'bde-onboarding'
      });
    } catch(err) { console.error('Notification Error', err); }

    res.json({ success: true, onboardingDocs: bde.onboardingDocs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin approves a single doc
export const approveOnboardingDoc = async (req, res) => {
  try {
    const { id, docName } = req.params;  // bdeId, docName
    const { approved } = req.body;        // true / false
    const bde = await BDE.findById(id);
    if (!bde) return res.status(404).json({ success: false, message: "BDE not found" });

    const doc = bde.onboardingDocs.find(d => d.docName === docName);
    if (!doc) return res.status(404).json({ success: false, message: "Document not found" });

    doc.verified = approved !== false;  // default true
    await bde.save();
    res.json({ success: true, onboardingDocs: bde.onboardingDocs });
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
    const bde = await BDE.findOne({ email: email ? email.toLowerCase().trim() : '', isActive: true });
    
    if (!bde || bde.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid credentials or account inactive" });
    }
    
    let country = 'india';
    if (bde.assignedCountries && bde.assignedCountries.length > 0) {
      country = bde.assignedCountries[0].toLowerCase();
    } else if (bde.country) {
      country = bde.country.toLowerCase();
    }

    res.json({ 
      success: true, 
      bde: { 
        _id: bde._id, 
        name: bde.name, 
        email: bde.email, 
        country: country,
        bdeType: bde.bdeType,
        assignedCountries: bde.assignedCountries || [country],
        assignedDistricts: bde.assignedDistricts || []
      }, 
      token: bde._id 
    });
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
    
    // Fetch BDE Converted Projects
    const bdeProjects = await ProjectOrder.find({ assignedBde: bdeId });
    const ordersGenerated = bdeProjects.length;
    
    const activeCustomers = await ProjectOrder.countDocuments({
      assignedBde: bdeId,
      status: { $nin: ["Project Completed", "Warranty Activated", "cancelled"] }
    });

    const conversionRatio = totalAssigned > 0 ? ((ordersGenerated / totalAssigned) * 100).toFixed(2) : 0;
    
    // Dynamic Revenue Calculation
    const revenueGenerated = bdeProjects.reduce((sum, p) => sum + (p.totalProjectCost || 0), 0);
    const revenueTarget = bde.targets?.revenue || 200000;

    // Dynamic STC Pipeline Calculations for Australia
    const stcPipeline = {
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0
    };

    bdeProjects.forEach(p => {
      if (p.country === "australia") {
        const status = p.stcDetails?.status || "not_started";
        if (status !== "not_started") {
          stcPipeline.total += 1;
          if (status === "approved") {
            stcPipeline.approved += 1;
          } else if (status === "rejected") {
            stcPipeline.rejected += 1;
          } else {
            stcPipeline.pending += 1;
          }
        }
      }
    });

    // Zone-wise Lead Distribution calculation
    const zoneStatsMap = {
      "Zone 1": { zone: "Zone 1 (Far North QLD/NT)", count: 0, kw: 0 },
      "Zone 2": { zone: "Zone 2 (WA North/QLD)", count: 0, kw: 0 },
      "Zone 3": { zone: "Zone 3 (NSW/VIC/QLD/SA/WA)", count: 0, kw: 0 },
      "Zone 4": { zone: "Zone 4 (TAS/VIC South)", count: 0, kw: 0 }
    };

    bdeProjects.forEach(p => {
      if (p.country === "australia" && p.stcDetails?.zone) {
        const zKey = p.stcDetails.zone; // e.g. "Zone 3"
        if (zoneStatsMap[zKey]) {
          zoneStatsMap[zKey].count += 1;
          zoneStatsMap[zKey].kw += p.systemSizeKW || 0;
        }
      }
    });

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

    // Analytics for Last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const leadsLast7Days = await Lead.countDocuments({
      assignedBde: bdeId,
      createdAt: { $gte: sevenDaysAgo }
    });

    const conversionsLast7Days = await ProjectOrder.countDocuments({
      assignedBde: bdeId,
      createdAt: { $gte: sevenDaysAgo }
    });

    res.json({
      success: true,
      bde,
      stats: {
        totalAssigned,
        activeCustomers,
        ordersGenerated,
        conversionRatio,
        todaysFollowups: todaysFollowupLeads.length,
        followupList: todaysFollowupLeads,
        districtStats,
        targetLeads: bde.targets?.leads || 0,
        targetConversions: bde.targets?.conversions || 0,
        revenue: { generated: revenueGenerated, target: revenueTarget },
        stcPipeline,
        zoneStats: Object.values(zoneStatsMap),
        last7Days: {
          leads: leadsLast7Days,
          conversions: conversionsLast7Days
        }
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
          
          
          lead.isInstallDateFixed = po.isInstallDateFixed || lead.isInstallDateFixed;
          lead.preferredInstallDate = po.preferredInstallDate || lead.preferredInstallDate;

          // Fetch selection type dynamically
          let epcSelectionType = "FCFS";
          try {
            let searchCountry = (lead.country || 'india').toLowerCase().trim();
            if (searchCountry === 'au') searchCountry = 'australia';
            if (searchCountry === 'in') searchCountry = 'india';
            if (searchCountry === 'nz') searchCountry = 'new-zealand';
            if (searchCountry === 'uk') searchCountry = 'uk';
            if (searchCountry === 'us' || searchCountry === 'usa') searchCountry = 'usa';

            const OrderJourneySettingsModel = (await import('../models/OrderJourneySettings.js')).OrderJourneySettings;
            let journeySettings = await OrderJourneySettingsModel.findOne({ 
              country: searchCountry, 
              state: lead.state || 'all', 
              district: lead.district || 'all', 
              discom: 'all' 
            });
            if (!journeySettings) {
              journeySettings = await OrderJourneySettingsModel.findOne({ 
                country: searchCountry, 
                state: 'all', 
                district: 'all', 
                discom: 'all' 
              });
            }
            const projectType = lead.solarType || 'residential';
            const journey = journeySettings?.journeys?.find(j => j.projectType === projectType && j.enabled);
            if (journey?.epcSelectionType) {
              epcSelectionType = journey.epcSelectionType;
            }
          } catch (settingsErr) {
            console.error('Error fetching settings in getBDELeads:', settingsErr);
          }
          lead.epcSelectionType = epcSelectionType;

          if (po.assignedEPCId) {
            try {
              const { default: EpcPartner } = await import('../models/EpcPartner.js');
              const epc = await EpcPartner.findById(po.assignedEPCId).select('companyName ownerName contactPerson mobile email').lean();
              if (epc) {
                lead.epcDetails = {
                  companyName: epc.companyName,
                  contactPerson: epc.ownerName || epc.contactPerson || "Installer Representative",
                  mobile: epc.mobile || "0412345671",
                  email: epc.email
                };
                lead.enquiryStatus = "EPC Accepted";
              }
            } catch (epcErr) {
              console.error('Error populating epcDetails in getBDELeads:', epcErr);
            }
          } else {
            const enquiry = await EpcEnquiry.findOne({ orderNumber: po.orderNumber }).populate('epcPartner', 'companyName contactPerson mobile email');
            if (enquiry && enquiry.epcPartner) {
              lead.epcDetails = enquiry.epcPartner;
              lead.enquiryStatus = enquiry.status;
            }
          }
          
          if (!lead.epcDetails && po.assignedEPCName) {
            lead.assignedEPCName = po.assignedEPCName;
          }
          
          lead.projectStatus = po.status;
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

    // 1. Determine BDE Countries
    let bdeCountries = bde.assignedCountries || [];
    if (bdeCountries.length === 0 && bde.country) {
      bdeCountries = [bde.country];
    }
    if (bdeCountries.length === 0) {
      bdeCountries = ['australia', 'india']; // default fallback
    }

    // Country conditions (flexible matching for australia/au or india/in)
    const countryConditions = bdeCountries.map(c => {
      const code = c.trim().toLowerCase();
      if (code === 'australia' || code === 'au') return { country: { $regex: /australia|au/i } };
      if (code === 'india' || code === 'in') return { country: { $regex: /india|in/i } };
      return { country: { $regex: new RegExp(code, 'i') } };
    });

    let baseQuery = { assignedBde: null };

    // 2. Active Territories (Region, Assigned Districts, Assigned States)
    const activeTerritories = [
      ...(bde.region ? [bde.region] : []),
      ...(bde.assignedRegions || []),
      ...(bde.assignedDistricts || []),
      ...(bde.assignedStates || [])
    ].filter(t => t && t.trim() && t.trim().toLowerCase() !== 'all' && t.trim().toLowerCase() !== 'unassigned');

    let andConditions = [baseQuery];

    // Add country filter
    if (countryConditions.length > 0) {
      andConditions.push({ $or: countryConditions });
    }

    // Add territory filter (substring match so "Sydney" matches "Wattle Crescent Sydney")
    if (activeTerritories.length > 0) {
      const terrRegexes = activeTerritories.map(t => new RegExp(t.trim(), 'i'));
      andConditions.push({
        $or: [
          { district: { $in: terrRegexes } },
          { city: { $in: terrRegexes } },
          { state: { $in: terrRegexes } },
          { pincode: { $in: terrRegexes } },
          { address: { $in: terrRegexes } }
        ]
      });
    }

    const unassignedQuery = andConditions.length > 1 ? { $and: andConditions } : baseQuery;

    const query = {
      $or: [
        unassignedQuery,
        { assignedBde: bde._id, status: 'assigned to bde' }
      ]
    };

    const demandLeads = await Lead.find(query).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, leads: demandLeads });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const assignLeadToBDE = async (req, res) => {
  try {
    const { leadId, bdeId } = req.body;
    if (!leadId || !bdeId) {
      return res.status(400).json({ success: false, message: "leadId and bdeId are required" });
    }

    // Atomic claim check: Only update if assignedBde is currently null OR already explicitly assigned to this BDE by Admin
    const lead = await Lead.findOneAndUpdate(
      { 
        _id: leadId, 
        $or: [
          { assignedBde: null }, 
          { assignedBde: bdeId, status: 'assigned to bde' }
        ] 
      },
      { 
        $set: { 
          assignedBde: bdeId, 
          status: 'Contacted' 
        },
        $push: { 
          history: { action: "Claimed by BDE", date: new Date() } 
        }
      },
      { new: true }
    );

    if (!lead) {
      return res.status(400).json({ 
        success: false, 
        message: "This lead has already been claimed by another BDE or is no longer available in the Demand Pool!" 
      });
    }
    
    res.json({ success: true, message: "Lead qualified and scheduled successfully", lead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAustralianEpcsForBde = async (req, res) => {
  try {
    const { default: EpcPartner } = await import('../models/EpcPartner.js');
    const { country = 'australia' } = req.query;
    
    let query = { isActive: true };
    if (country.toLowerCase() === 'australia') {
      query.$or = [{ country: 'australia' }, { state: { $regex: /new south wales|nsw|queensland|qld|victoria|vic/i } }];
    }

    const epcs = await EpcPartner.find(query)
      .select('companyName ownerName contactPerson email mobile phone rating totalRatings totalInstallations city state country kycDocuments')
      .lean();

    res.json({ success: true, count: epcs.length, data: epcs });
  } catch (error) {
    console.error('getAustralianEpcsForBde error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBDELead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.leadId);
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
    
    if (req.body.nextFollowUp) lead.nextFollowUp = req.body.nextFollowUp;
    if (req.body.status) {
      lead.status = req.body.status;
      lead.history.push({ action: `Status updated to ${req.body.status} by BDE`, date: new Date() });

      if (req.body.status === 'Converted') {
        try {
          const Notification = (await import('../models/Notification.js')).default;
          await Notification.create({
            role: 'Admin',
            title: `⚡ Customer ${lead.name} Ready for Installation!`,
            message: `Customer ${lead.name} (${lead.mobile}) is ready to be converted into an active installation order. Preferred Date: ${lead.preferredInstallDate ? new Date(lead.preferredInstallDate).toLocaleDateString("en-IN") : 'Pending'}.`,
            leadId: lead._id
          });
          console.log(`[Notification Created] Admin alerted for converted lead: ${lead.name}`);
        } catch (nErr) {
          console.error("Failed creating admin notification:", nErr);
        }
      }
    }
    if (req.body.preferredInstallDate) lead.preferredInstallDate = new Date(req.body.preferredInstallDate);
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
    
    const updates = ['name', 'mobile', 'email', 'district', 'state', 'pincode', 'kw', 'billAmount', 'solarType', 'notes', 'consumerNumber', 'discom', 'tariff', 'meterCategory', 'billUrl', 'nmi', 'rooftopPhoto', 'retailer'];
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

export const moveLeadToOrderJourney = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.leadId);
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
    lead.bdeMovedToOrderJourney = true;
    lead.history.push({ action: "BDE manually moved lead to Order Journey", date: new Date() });
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

    const projects = await ProjectOrder.find(filter).sort({ createdAt: -1 }).lean();
    const Lead = (await import('../models/Lead.js')).default;
    const projectLeads = await Lead.find({ convertedProjectId: { $in: projects.map(p => p._id) } }).lean();

    const eligibleProjects = projects.filter(p => {
      const lead = projectLeads.find(l => l.convertedProjectId?.toString() === p._id.toString());
      if (!lead) return true; // If no lead found, just show it
      
      const isAU = lead.country?.toLowerCase() === 'australia' || lead.country?.toLowerCase() === 'au';
      if (isAU) {
        return lead.bdeMovedToOrderJourney || lead.status === 'Converted';
      } else {
        return lead.tokenPaid && lead.assignedEPCId;
      }
    });

    res.json({ success: true, projects: eligibleProjects });
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
    const { projectId, stepId } = req.params;
    const { note, uploadedActions: rawActions } = req.body;
    
    const project = await ProjectOrder.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    const stepIndex = project.steps.findIndex(s => s.stepId === stepId);
    if (stepIndex === -1) return res.status(404).json({ success: false, message: "Step not found" });

    let fileUrl = "";
    if (req.file) {
      // Mock upload URL - in production use S3/Cloudinary
      fileUrl = `/uploads/bde-docs/${Date.now()}-${req.file.originalname}`;
      project.steps[stepIndex].evidenceUrl = fileUrl;
    }
    
    if (note) {
      project.steps[stepIndex].evidenceNote = note;
    }

    let uploadedActions = [];
    if (rawActions) {
      try {
        uploadedActions = typeof rawActions === 'string' ? JSON.parse(rawActions) : rawActions;
      } catch (err) {
        console.error('Error parsing uploadedActions:', err);
      }
    }
    
    // Use the shared helper to advance the journey correctly
    const { processStepCompletionEngine } = await import('../utils/stepEngine.js');
    const result = await processStepCompletionEngine(project, stepId, 'BDE', fileUrl, note || "", "bde", uploadedActions);
    
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
    
    console.log('\n======================================================');
    console.log(`🚀 [BDE OTP GENERATED] For: ${identifier} | OTP CODE: ${otp}`);
    console.log('======================================================\n');
    
    if (identifier.includes('@')) {
      try {
        await axios.post(
          'https://api.brevo.com/v3/smtp/email',
          {
            sender:  { name: 'EmergeSun BDE Portal', email: process.env.BREVO_SENDER_EMAIL },
            to:      [{ email: identifier.toLowerCase() }],
            subject: 'Your EmergeSun BDE Login OTP',
            htmlContent: `
              <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
                <div style="text-align:center;margin-bottom:20px;">
                  <h2 style="color:#1d4ed8;margin:0;">EmergeSun BDE Portal</h2>
                  <p style="color:#6b7280;font-size:13px;margin-top:4px;">Solar Project Management Platform</p>
                </div>
                <p style="color:#374151;font-size:15px;">Your OTP for login/reset is:</p>
                <div style="background:#eff6ff;border:2px solid #3b82f6;border-radius:10px;padding:24px;text-align:center;margin:20px 0;">
                  <span style="font-size:40px;font-weight:bold;letter-spacing:16px;color:#1d4ed8;">${otp}</span>
                </div>
                <p style="color:#6b7280;font-size:13px;">This OTP is valid for <strong>10 minutes</strong>. Do not share with anyone.</p>
                <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;"/>
                <p style="color:#9ca3af;font-size:12px;text-align:center;">If you did not request this, please ignore.</p>
              </div>
            `,
          },
          {
            headers: {
              'api-key':      process.env.BREVO_API_KEY,
              'Content-Type': 'application/json',
              'Accept':       'application/json',
            },
            timeout: 15000,
          }
        );
        console.log(`✅ Brevo API OTP sent successfully to BDE Email: ${identifier}`);
      } catch (emailErr) {
        console.error('❌ Failed to send email via Brevo:', emailErr.message);
      }
    } else {
      console.log(`⚠️ Email sending skipped because identifier is not an email (${identifier})`);
    }

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
    const { district } = req.query;
    const startDate = new Date();
    startDate.setHours(0,0,0,0);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 45); // Next 45 days

    const queryFilter = { date: { $gte: startDate, $lte: endDate } };
    if (district) {
      queryFilter.district = { $regex: new RegExp(district, 'i') };
    }

    const calendarEntries = await EpcCalendar.find(queryFilter).populate('epcPartner', 'companyName rating contactPerson').sort({ date: 1 });

    const { default: EpcPartner } = await import('../models/EpcPartner.js');
    const epcCount = await EpcPartner.countDocuments({ isActive: true });

    const dayAvailabilityMap = {};
    const d = new Date(startDate);
    while (d <= endDate) {
      const dateStr = d.toISOString().split('T')[0];
      const dayEntries = calendarEntries.filter(e => e.date && e.date.toISOString().split('T')[0] === dateStr);
      
      const isBlockedOrFull = dayEntries.length > 0 && dayEntries.every(e => e.isBlocked || e.currentBookings >= e.maxBookings);
      
      dayAvailabilityMap[dateStr] = {
        date: dateStr,
        isFullyBooked: isBlockedOrFull, // 🔴 Red if full/blocked, 🟢 Green if free
        color: isBlockedOrFull ? 'red' : 'green',
        statusText: isBlockedOrFull ? '🔴 All EPCs Booked' : '🟢 EPC Available',
        totalEpcs: epcCount || dayEntries.length || 1,
        entries: dayEntries
      };
      d.setDate(d.getDate() + 1);
    }

    res.json({ success: true, availability: dayAvailabilityMap, slots: calendarEntries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const scheduleAndQualifyLead = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { scheduledDate, notes } = req.body;
    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    // Mark as booked, but do NOT set status to Converted yet so it remains in Prospect
    lead.status = 'Interested'; // Keep it active
    lead.installDateBooked = true; // This makes it a prospect
    if (scheduledDate) {
      lead.preferredInstallDate = new Date(scheduledDate);
      lead.finalInstallDate = new Date(scheduledDate);
      lead.isInstallDateFixed = true;
    }
    if (notes) lead.notes = notes;
    lead.history.push({ 
      action: `Installation Date Finalized by BDE`, 
      date: new Date() 
    });
    await lead.save();

    // Trigger Notification for Customer and EPC
    try {
      const { default: Notification } = await import('../models/Notification.js');
      // To EPCs / Admin (Broadcasted)
      await Notification.create({
        role: 'EPC', // Assuming EPCs can see these
        title: 'New Installation Date Fixed',
        message: `Lead ${lead.name} has finalized installation date for ${new Date(scheduledDate).toLocaleDateString()}.`,
        leadId: lead._id
      });
      // To Customer
      await Notification.create({
        role: 'Customer',
        title: 'Installation Date Confirmed',
        message: `Your installation has been scheduled for ${new Date(scheduledDate).toLocaleDateString()}.`,
        leadId: lead._id,
        userId: lead._id // If Customer notifications use leadId or userId
      });
    } catch (notifErr) {
      console.error("Failed to create notifications:", notifErr);
    }

    res.json({ success: true, lead, message: 'Installation date locked successfully! The lead is now moved to your Prospects.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ==============================
// Admin BDE Manual Assignment
// ==============================

export const getEligibleBDEsForLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.leadId);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    const leadState = (lead.state || '').trim().toLowerCase();
    const leadDistrict = (lead.district || lead.city || '').trim().toLowerCase();

    if (!leadState) {
      return res.status(400).json({ success: false, message: 'Lead has no state defined. State match is compulsory.' });
    }

    // Find active BDEs assigned to this state
    // We use a regex match on array elements to make it case-insensitive
    const bdes = await BDE.find({
      isActive: true,
      assignedStates: { $regex: new RegExp('^' + leadState + '$', 'i') }
    }).select('name email mobile assignedStates assignedDistricts');

    // For each BDE, fetch their converted leads count
    const bdeStats = await Promise.all(bdes.map(async (bde) => {
      // Converted lead count: Lead is assigned to this BDE AND hasLoggedIn is true
      const convertedCount = await Lead.countDocuments({
        assignedBde: bde._id,
        hasLoggedIn: true
      });

      // Check if district matches (preferred)
      let districtMatch = false;
      if (leadDistrict && bde.assignedDistricts && bde.assignedDistricts.length > 0) {
        districtMatch = bde.assignedDistricts.some(d => d.trim().toLowerCase() === leadDistrict);
      }

      return {
        _id: bde._id,
        name: bde.name,
        email: bde.email,
        mobile: bde.mobile,
        districtMatch,
        convertedCount
      };
    }));

    // Sort: District match first, then by converted count descending
    bdeStats.sort((a, b) => {
      if (a.districtMatch === b.districtMatch) {
        return b.convertedCount - a.convertedCount;
      }
      return a.districtMatch ? -1 : 1;
    });

    res.json({ success: true, data: bdeStats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const adminAssignLeadToBDE = async (req, res) => {
  try {
    const { leadId, bdeId } = req.body;
    if (!leadId || !bdeId) {
      return res.status(400).json({ success: false, message: 'leadId and bdeId are required' });
    }

    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    lead.assignedBde = bdeId;
    lead.status = 'assigned to bde';
    lead.history.push({ action: 'Admin assigned lead to you', date: new Date() });
    
    await lead.save();

    res.json({ success: true, message: 'Lead successfully assigned to BDE', data: lead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================
// GET BDES HIERARCHY
// ==============================
export const getBDEsHierarchy = async (req, res) => {
  try {
    const bdes = await BDE.find().sort({ createdAt: -1 });

    const hierarchy = {};

    bdes.forEach(bde => {
      const country = (bde.country || 'India').toUpperCase();
      const state = (bde.assignedStates && bde.assignedStates[0]) || 'Unassigned State';
      const district = (bde.assignedDistricts && bde.assignedDistricts[0]) || 'Unassigned District';

      if (!hierarchy[country]) hierarchy[country] = {};
      if (!hierarchy[country][state]) hierarchy[country][state] = {};
      if (!hierarchy[country][state][district]) hierarchy[country][state][district] = [];

      hierarchy[country][state][district].push(bde);
    });

    res.json({ success: true, hierarchy });
  } catch (error) {
    console.error("BDE Hierarchy error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markLeadEligible = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { isEligibleForInstallation } = req.body;
    const Lead = (await import("../models/Lead.js")).default || (await import("../models/Lead.js")).Lead;
    const lead = await Lead.findByIdAndUpdate(
      leadId,
      { isEligibleForInstallation },
      { new: true }
    );
    if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
    res.json({ success: true, lead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
