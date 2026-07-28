/**
 * leadController.js — Lead Generation Module
 * No User/auth dependency — admin panel is single-admin, no JWT required for these routes
 * All routes are protected by simple admin session check in server.js
 */

import multer from 'multer';
import * as XLSX from 'xlsx';
import Lead from '../models/Lead.js';
import DemandSupplySettings from '../models/DemandSupplySettings.js';

// Multer memory storage for bulk upload
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// ─── CREATE LEAD ──────────────────────────────────────────────────────────────
export const createLead = async (req, res) => {
  try {
    const {
      name, mobile, phone, whatsapp, email,
      state, district, city, pincode, address,
      solarType, project, kw, systemCapacity,
      billAmount, consumerNumber, discom, tariff, meterCategory,
      sourceOfMedia, profession, notes,
    } = req.body;

    const resolvedMobile = mobile || phone || '';
    const resolvedSolarType = solarType || project || 'general';
    const resolvedKw = kw || systemCapacity || '0';

    if (!name?.trim())
      return res.status(400).json({ success: false, message: 'Name is required' });
    if (!resolvedMobile?.trim())
      return res.status(400).json({ success: false, message: 'Mobile is required' });

    if (email && email.trim() !== '') {
      const existing = await Lead.findOne({ email: email.trim(), isActive: true });
      if (existing) {
        return res.status(400).json({ success: false, message: 'You have already submitted your query' });
      }
    }
    
    if (resolvedMobile && resolvedMobile.trim() !== '') {
      const existing = await Lead.findOne({ mobile: resolvedMobile.trim(), isActive: true });
      if (existing) {
        return res.status(400).json({ success: false, message: 'You have already submitted your query' });
      }
    }

    // Validate Demand/Supply Auto-pause
    const demandSettings = await DemandSupplySettings.getSingleton();
    const region = demandSettings.regions.find(r => r.state === state && r.district === district);
    
    if (region && region.autoPauseWhenFull) {
      if (region.isAcceptancePaused || region.currentPendingProjects >= region.maxActiveDemand) {
        return res.status(403).json({
          success: false, 
          message: `Demand generation for ${district}, ${state} is temporarily paused due to high capacity. Please try again later.`
        });
      }
    }

    const lead = await Lead.create({
      name: name.trim(),
      mobile: resolvedMobile.trim(),
      whatsapp: whatsapp || resolvedMobile.trim(),
      email: email || undefined,
      state, district, city, pincode, address,
      solarType: resolvedSolarType,
      kw: resolvedKw,
      billAmount: billAmount || 0,
      consumerNumber,
      discom,
      tariff,
      meterCategory,
      sourceOfMedia, profession, notes,
      history: [{ action: 'Created' }],
    });

    res.status(201).json({ success: true, data: lead });
  } catch (err) {
    console.error('createLead error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET ALL LEADS ────────────────────────────────────────────────────────────
export const getAllLeads = async (req, res) => {
  try {
    const {
      status, search, country, district, city, project,
      startDate, endDate,
      page = 1, limit = 50,
    } = req.query;

    const query = { isActive: true };

    if (status && status !== 'All') query.status = status;
    if (country && country !== 'All') query.country = country;
    if (district && district !== 'All') query.district = district;
    if (city && city !== 'All') query.city = city;
    if (project && project !== 'All') query.solarType = project;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, count: leads.length, total, page: Number(page), data: leads });
  } catch (err) {
    console.error('getAllLeads error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET LEAD BY ID ───────────────────────────────────────────────────────────
export const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, isActive: true });
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── UPDATE LEAD ──────────────────────────────────────────────────────────────
export const updateLead = async (req, res) => {
  try {
    const { status, ...updateData } = req.body;
    let lead = await Lead.findOne({ _id: req.params.id, isActive: true });
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    Object.assign(lead, updateData);
    if (status && status !== lead.status) {
      lead.status = status;
      lead.history.push({ action: `Status updated to ${status}` });
    }

    await lead.save();
    res.json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE LEAD (soft) ───────────────────────────────────────────────────────
export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET LEADS BY PROJECT ─────────────────────────────────────────────────────
export const getLeadsByProject = async (req, res) => {
  try {
    const { slug } = req.params;
    const { status, search, page = 1, limit = 50 } = req.query;
    const query = { solarType: slug, isActive: true };

    if (status && status !== 'All') query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, count: leads.length, total, page: Number(page), data: leads });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ASSIGN LEAD ──────────────────────────────────────────────────────────────
export const assignLead = async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const lead = await Lead.findOne({ _id: req.params.id, isActive: true });
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    lead.assignedTo = assignedTo;
    lead.history.push({ action: `Assigned to ${assignedTo}` });
    await lead.save();

    res.json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── BULK UPLOAD CSV/XLSX ─────────────────────────────────────────────────────
export const uploadLeads = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: 'File required' });

    const project = req.body.project || 'general';
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!rows.length)
      return res.status(400).json({ success: false, message: 'No data found in file' });

    const leads = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const mobile = String(row.phone || row.mobile || '').trim();
      const name = String(row.name || '').trim();
      if (!mobile) { errors.push(`Row ${i + 2}: phone/mobile missing`); continue; }

      leads.push({
        name: name || 'Unknown',
        mobile,
        whatsapp: mobile,
        email: row.email || undefined,
        state: row.state || undefined,
        district: row.district || undefined,
        city: row.city || undefined,
        pincode: row.pincode ? String(row.pincode) : undefined,
        address: row.address || undefined,
        solarType: project,
        kw: row.systemCapacity ? String(row.systemCapacity) : '0',
        billAmount: row.billAmount ? Number(row.billAmount) : 0,
        notes: row.notes || undefined,
        history: [{ action: 'Bulk uploaded' }],
      });
    }

    if (!leads.length)
      return res.status(400).json({ success: false, message: 'No valid leads found', errors });

    let insertedCount = 0;
    try {
      const inserted = await Lead.insertMany(leads, { ordered: false });
      insertedCount = inserted.length;
    } catch (bulkErr) {
      if (bulkErr.code === 11000 || bulkErr.name === 'BulkWriteError') {
        insertedCount = bulkErr.insertedDocs ? bulkErr.insertedDocs.length : 0;
        errors.push(`${leads.length - insertedCount} leads were skipped due to duplicate mobile numbers.`);
      } else {
        throw bulkErr;
      }
    }

    res.json({
      success: true,
      message: `${insertedCount} leads uploaded successfully`,
      total: insertedCount,
      errors: errors.length ? errors : undefined,
    });
  } catch (err) {
    console.error('uploadLeads error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
export const getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const matchStage = { isActive: true };

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const trendMatch = { ...matchStage, createdAt: { $gte: thirtyDaysAgo } };

    const [statusStats, projectStats, total, dailyTrend] = await Promise.all([
      Lead.aggregate([{ $match: matchStage }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
      Lead.aggregate([{ $match: matchStage }, { $group: { _id: '$solarType', count: { $sum: 1 } } }]),
      Lead.countDocuments(matchStage),
      Lead.aggregate([
        { $match: trendMatch },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({ success: true, data: { total, statusStats, projectStats, dailyTrend } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ─── CONVERT LEAD TO PROJECT ORDER ─────────────────────────────────────────────
import { ProjectOrder } from '../models/ProjectModel.js';
import { OrderJourneySettings } from '../models/OrderJourneySettings.js';
import EpcCalendar from '../models/EpcCalender.js';
import EpcEnquiry from '../models/EpcEnquiry.js';

export const convertLeadToProject = async (req, res) => {
  try {
    const leadId = req.params.id;
    const { epcCalendarSlotId } = req.body || {};
    
    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    
    if (lead.status === 'Converted') {
      return res.status(400).json({ success: false, message: 'Lead already converted' });
    }

    let projectType = lead.solarType || 'residential';
    const validProjectTypes = ["residential", "commercial", "group", "common-meter"];
    if (!validProjectTypes.includes(projectType)) {
        if (projectType === 'surya-ghar') projectType = 'residential';
        else projectType = 'residential';
    }

    let journeySettings = await OrderJourneySettings.findOne({ 
      country: lead.country || 'india', 
      state: lead.state || 'all', 
      district: lead.district || 'all', 
      discom: 'all' 
    });
    
    if (!journeySettings) {
      journeySettings = await OrderJourneySettings.findOne({ 
        country: lead.country || 'india', 
        state: 'all', 
        district: 'all', 
        discom: 'all' 
      });
    }

    if (!journeySettings) {
      journeySettings = await OrderJourneySettings.findOne({ country: 'india' }); // ultimate fallback
    }

    const journey = journeySettings?.journeys?.find(j => j.projectType === projectType && j.enabled);
    
    let steps = [];
    if (journey) {
      steps = journey.steps.filter(s => s.enabled).map((s, idx) => ({
        stepId: s.id,
        stepNumber: s.stepNumber || (idx + 1),
        title: s.title,
        description: s.description,
        status: 'pending',
        requiresDoc: !!s.requiresDocumentUpload,
        documentRequirements: s.documentRequirements || [],
        notificationMedium: s.notificationMedium || ['email']
      }));
    } else {
      // Fallback default steps if admin hasn't configured OrderJourneySettings yet
      steps = [
        { stepId: 'survey', stepNumber: 1, title: 'Site Survey', description: 'Technical site survey by EPC partner', status: 'pending', requiresDoc: true },
        { stepId: 'design', stepNumber: 2, title: 'Design & Approvals', description: 'System design and net-metering approvals', status: 'pending', requiresDoc: false },
        { stepId: 'installation', stepNumber: 3, title: 'Installation', description: 'Solar panel installation and wiring', status: 'pending', requiresDoc: true },
        { stepId: 'commissioning', stepNumber: 4, title: 'Commissioning', description: 'System activation and final testing', status: 'pending', requiresDoc: true }
      ];
    }

    let assignedEpc = null;
    let installationDate = req.body?.preferredDate || null;
    
    if (epcCalendarSlotId) {
      const slot = await EpcCalendar.findById(epcCalendarSlotId);
      if (slot) {
        installationDate = slot.date;
      }
    }

    if (steps.length > 0) {
      steps[0].status = 'in-progress';
      steps[0].startedAt = new Date();
    }

    const po = new ProjectOrder({
      customerName: lead.name,
      customerMobile: lead.mobile,
      customerEmail: lead.email,
      projectType,
      systemSizeKW: parseFloat(lead.kw) || 0,
      monthlyBillAmount: lead.billAmount || 0,
      state: lead.state || '',
      location: { city: lead.city, pincode: lead.pincode, address: lead.address },
      steps,
      currentStepNumber: steps.length > 0 ? steps[0].stepNumber : 1,
      currentStepTitle: steps.length > 0 ? steps[0].title : 'Project Started',
      completionPercentage: 0,
      status: 'Enquiry Created',
      assignedBde: lead.assignedBde,
      assignedEPCId: assignedEpc ? assignedEpc.toString() : null,
      preferredInstallDate: installationDate
    });
    
    await po.save();

    // Map project type to EpcEnquiry enum
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
    const mappedType = pTypeMap[projectType] || "Residential Solar";

    const kw = parseFloat(lead.kw) || 1;
    const tokenAmt = kw * 2000;

    const enquiry = new EpcEnquiry({
      customerName: po.customerName,
      customerMobile: po.customerMobile,
      customerEmail: po.customerEmail || "",
      enquiryType: 'ECommerce',
      projectType: mappedType,
      systemCapacityKw: po.systemSizeKW,
      state: po.state || "",
      district: lead.district || lead.city || po.location?.city || "",
      city: po.location?.city || "",
      address: po.location?.address || "",
      rooftopPhoto: "",
      preferredInstallDate: po.preferredInstallDate,
      tokenAmount: tokenAmt,
      tokenPaid: false,
      status: 'Open For EPC',
      assignmentType: 'FirstComeFirstServe',
      orderNumber: po.orderNumber
    });
    await enquiry.save();

    lead.status = 'Converted';
    lead.convertedProjectId = po._id;
    lead.history.push({ action: 'Converted to Project', date: new Date() });
    await lead.save();

    res.json({ success: true, message: 'Lead converted successfully', projectOrder: po });
  } catch (error) {
    console.error('convertLeadToProject error:', error);
    res.status(500).json({ success: false, message: 'Server Error during conversion' });
  }
};
