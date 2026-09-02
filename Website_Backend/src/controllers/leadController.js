import { sendOTP } from '../utils/smsService.js';
import { sendOtpEmail } from '../utils/sendOtpEmail.js';
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
      totalCost, subsidy,
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

    const countryHeader = req.headers['x-country'] || req.body.country || 'india';
    const leadCountry = countryHeader.toLowerCase() === 'australia' ? 'australia' : (req.body.country || 'india').toLowerCase();

    const lead = await Lead.create({
      name: name.trim(),
      mobile: resolvedMobile.trim(),
      whatsapp: whatsapp || resolvedMobile.trim(),
      email: email || undefined,
      country: leadCountry,
      state, district, city, pincode, address,
      solarType: resolvedSolarType,
      kw: resolvedKw,
      totalCost: totalCost || 0,
      subsidy: subsidy || 0,
      billAmount: billAmount || 0,
      consumerNumber,
      discom,
      tariff,
      meterCategory,
      sourceOfMedia, profession, notes,
      billUrl: req.body.billUrl || undefined,
      rooftopPhoto: req.body.rooftopPhoto || undefined,
      uploadSource: req.body.uploadSource || 'website',
      history: [{ action: 'Created' }],
    });

    res.status(201).json({ success: true, data: lead });
  } catch (err) {
    console.error('createLead error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── EXPORT UNASSIGNED LEADS (CSV FOR BDE DISTRIBUTION) ─────────────────────
export const exportUnassignedLeads = async (req, res) => {
  try {
    const { country, state, district, status, search, uploadSource } = req.query;

    const query = { isActive: true, assignedBde: null };
    if (uploadSource) {
      query.uploadSource = uploadSource;
    }

    if (status && status !== 'All') {
      query.status = status;
    } else {
      query.status = { $ne: 'Converted' };
    }

    if (country && country !== 'All') {
      query.country = { $regex: new RegExp(country.trim(), 'i') };
    }
    if (state && state !== 'All') {
      query.state = { $regex: new RegExp(state.trim(), 'i') };
    }
    if (district && district !== 'All') {
      const dRegex = new RegExp(district.trim(), 'i');
      query.$or = [{ district: dRegex }, { city: dRegex }, { address: dRegex }, { pincode: dRegex }, { postcode: dRegex }];
    }
    if (search && search.trim()) {
      const sRegex = new RegExp(search.trim(), 'i');
      const searchOr = [
        { name: sRegex },
        { mobile: sRegex },
        { email: sRegex },
        { district: sRegex },
        { city: sRegex },
        { address: sRegex },
        { consumerNumber: sRegex }
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchOr }];
        delete query.$or;
      } else {
        query.$or = searchOr;
      }
    }

    const leads = await Lead.find(query).sort({ createdAt: -1 });

    const headers = [
      "Lead ID",
      "Customer Name",
      "Mobile",
      "Email",
      "Country",
      "State",
      "District / Suburb",
      "Postcode",
      "Address",
      "Solar Type",
      "System Size (kW)",
      "Bill Amount",
      "Consumer / NMI Number",
      "Retailer / DISCOM",
      "Status",
      "Date Created",
      "Notes"
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvRows = [
      headers.join(','),
      ...leads.map(l => [
        escapeCsv(l.orderNumber || l._id),
        escapeCsv(l.name),
        escapeCsv(l.mobile),
        escapeCsv(l.email),
        escapeCsv(l.country || 'India'),
        escapeCsv(l.state),
        escapeCsv(l.district || l.city),
        escapeCsv(l.postcode || l.pincode),
        escapeCsv(l.address),
        escapeCsv(l.solarType),
        escapeCsv(l.kw || '0'),
        escapeCsv(l.billAmount || 0),
        escapeCsv(l.consumerNumber),
        escapeCsv(l.discom || l.retailer),
        escapeCsv(l.status),
        escapeCsv(l.createdAt ? new Date(l.createdAt).toLocaleDateString("en-IN") : ''),
        escapeCsv(l.notes)
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const filename = `unassigned_leads_${Date.now()}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send('\uFEFF' + csvContent);
  } catch (err) {
    console.error('exportUnassignedLeads error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET LEAD STATS ───────────────────────────────────────────────────────────
export const getLeadStats = async (req, res) => {
  try {
    const { uploadSource } = req.query;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const baseQuery = { isActive: true };
    if (uploadSource) {
      if (uploadSource === 'website') {
        baseQuery.uploadSource = { $in: ['website', null] };
      } else {
        baseQuery.uploadSource = uploadSource;
      }
    }

    const [total, today, newLeads, converted] = await Promise.all([
      Lead.countDocuments({ ...baseQuery }),
      Lead.countDocuments({ ...baseQuery, createdAt: { $gte: todayStart } }),
      Lead.countDocuments({ ...baseQuery, $or: [{ status: 'New' }, { assignedBde: null }] }),
      Lead.countDocuments({ ...baseQuery, status: 'Converted' }),
    ]);

    res.json({
      
      success: true,
      data: {
        total,
        today,
        newLeads,
        converted
      }
    });
  } catch (err) {
    console.error('getLeadStats error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET ALL LEADS (WITH PAGINATION & FILTERS) ──────────────────────────────
export const getAllLeads = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      status,
      country,
      district,
      city,
      state,
      project,
      solarType,
      search,
      cardFilter,
      startDate,
      endDate,
      uploadSource,
      assignedBde,
    } = req.query;

    const query = { isActive: true };

    if (uploadSource) {
      if (uploadSource === 'website') {
        query.uploadSource = { $in: ['website', null] };
      } else {
        query.uploadSource = uploadSource;
      }
    }

    if (assignedBde) {
      if (assignedBde === 'unassigned') {
        query.assignedBde = null;
      } else {
        query.assignedBde = assignedBde;
      }
    }

    // Card filter overrides
    if (cardFilter === 'today') {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      query.createdAt = { $gte: todayStart };
    } else if (cardFilter === 'newLeads' || cardFilter === 'unassigned') {
      query.$or = [{ status: 'New' }, { assignedBde: null }];
    } else if (cardFilter === 'converted') {
      query.status = 'Converted';
    }

    if (status && status !== 'All' && !cardFilter) {
      if (status === 'Unassigned') {
        query.assignedBde = null;
      } else {
        query.status = status;
      }
    }

    const typeToMatch = solarType || project;
    if (typeToMatch && typeToMatch !== 'All') {
      query.solarType = typeToMatch;
    }

    if (country && country !== 'All') {
      query.country = new RegExp('^' + country.trim() + '$', 'i');
    }

    if (state && state !== 'All') {
      query.state = new RegExp('^' + state.trim() + '$', 'i');
    }

    const distToMatch = district || city;
    if (distToMatch && distToMatch !== 'All') {
      const distRegex = new RegExp(distToMatch.trim(), 'i');
      query.$or = [
        { district: distRegex },
        { city: distRegex },
        { address: distRegex },
        { pincode: distRegex },
        { postcode: distRegex }
      ];
    }

    if (startDate || endDate) {
      if (!query.createdAt) query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (search && search.trim()) {
      const sRegex = new RegExp(search.trim(), 'i');
      const searchOr = [
        { name: sRegex },
        { mobile: sRegex },
        { email: sRegex },
        { district: sRegex },
        { city: sRegex },
        { address: sRegex },
        { consumerNumber: sRegex },
        { pincode: sRegex },
        { postcode: sRegex }
      ];

      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchOr }];
        delete query.$or;
      } else {
        query.$or = searchOr;
      }
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
    let lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    Object.assign(lead, updateData);
    if (status && status !== lead.status) {
      lead.status = status;
      lead.history.push({ action: `Status updated to ${status}` });
    }

    if (req.body.tokenPaid) {
      const { ProjectOrder } = await import("../models/ProjectModel.js");
      const EpcEnquiry = (await import("../models/EpcEnquiry.js")).default;
      let existingOrder = await ProjectOrder.findOne({ customerMobile: lead.mobile }).sort({ createdAt: -1 });
      
      let targetOrderNumber = "";
      if (existingOrder) {
        lead.convertedProjectId = existingOrder._id;
        lead.history.push({ action: "Linked to existing ProjectOrder: " + existingOrder.orderNumber });
        existingOrder.leadId = lead._id;
        targetOrderNumber = existingOrder.orderNumber;
        
        let targetStep = existingOrder.steps?.find(s => s.milestoneType === 'customer_payment' || s.title.toLowerCase().includes("pay") || s.title.toLowerCase().includes("token"));
        if (!targetStep && existingOrder.steps?.length > 0) {
          targetStep = existingOrder.steps.find(s => s.status === 'in-progress' || s.status === 'pending');
        }
        if (targetStep) {
          const { processStepCompletionEngine } = await import('../utils/stepEngine.js');
          await processStepCompletionEngine(existingOrder, targetStep.stepId, 'System', '', 'Simulated Token Payment');
        }
        await existingOrder.save();
      } else {
        targetOrderNumber = "ORD-" + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
        const newOrder = await ProjectOrder.create({
          orderNumber: targetOrderNumber,
          customerName: lead.name,
          customerMobile: lead.mobile,
          customerEmail: lead.email,
          country: lead.country,
          state: lead.state,
          district: lead.district,
          projectType: lead.solarType || "surya-ghar",
          status: "Project Under Evaluation",
          assignedBde: lead.assignedBde,
          assignedEPCId: lead.assignedEpc || null
        });
        lead.convertedProjectId = newOrder._id;
        lead.history.push({ action: "Created ProjectOrder: " + targetOrderNumber });
        existingOrder = newOrder;
      }
      
      // Ensure EpcEnquiry exists so EPC can claim it from Demand Pool
      let enquiry = await EpcEnquiry.findOne({ orderNumber: targetOrderNumber });
      if (!enquiry) {
        enquiry = new EpcEnquiry({
          customerName: lead.name,
          customerMobile: lead.mobile,
          customerEmail: lead.email || "",
          enquiryType: 'ECommerce',
          projectType: (function(){
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
            return pTypeMap[lead.solarType?.toLowerCase()] || "Residential Solar";
          })(),
          systemCapacityKw: parseFloat(lead.kw) || 1,
          state: lead.state || "",
          district: lead.district || lead.city || "",
          city: lead.city || "",
          address: lead.address || "",
          preferredInstallDate: lead.preferredInstallDate,
          tokenAmount: (parseFloat(lead.kw) || 1) * 2000,
          tokenPaid: true,
          tokenPaidAt: new Date(),
          status: 'Open For EPC',
          assignmentType: 'FirstComeFirstServe',
          orderNumber: targetOrderNumber
        });
        await enquiry.save();
      } else {
        enquiry.tokenPaid = true;
        enquiry.tokenPaidAt = new Date();
        enquiry.status = 'Open For EPC';
        await enquiry.save();
      }
      
      // Try to auto convert if all 4 conditions are met
      setTimeout(() => {
         import('./leadController.js').then(m => m.attemptAutoConversion(lead)).catch(console.error);
      }, 1000);
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
    if (req.body.tokenPaid && !lead.convertedProjectId) {
      const { ProjectOrder } = await import("../models/ProjectModel.js");
      const orderNumber = "ORD-" + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
      const newOrder = await ProjectOrder.create({
        orderNumber,
        customerName: lead.name,
        customerMobile: lead.mobile,
        customerEmail: lead.email,
        country: lead.country,
        state: lead.state,
        district: lead.district,
        projectType: lead.solarType || "surya-ghar",
        status: "Project Under Evaluation",
        assignedBde: lead.assignedBde,
        assignedEPCId: lead.assignedEpc || null
      });
      lead.convertedProjectId = newOrder._id;
      lead.history.push({ action: "Converted to ProjectOrder: " + orderNumber });
    }
    await lead.save();

    res.json({ success: true, data: lead });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── BULK UPLOAD CSV/XLSX ─────────────────────────────────────────────────────
export const uploadLeads = async (req, res) => {
  console.log("=== BULK UPLOAD STARTED ===");
  console.log("Body:", req.body);
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: 'File required' });

    const project = req.body.project || 'general';
    const solarType = req.body.solarType || 'residential';
    const country = req.body.country || 'India';
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
      const name = String(row.name || row.full_name || row.Name || '').trim();
      if (!mobile) { errors.push(`Row ${i + 2}: phone/mobile missing`); continue; }

      leads.push({
        name: name || 'Unknown',
        mobile,
        whatsapp: mobile,
        email: row.email || undefined,
        state: row.state || undefined,
        district: row.district || row.city || row.City || undefined,
        city: row.city || undefined,
        pincode: (row.pincode || row.postcode) ? String(row.pincode || row.postcode) : undefined,
        address: row.address || undefined,
        solarType: solarType,
        country: country,
        kw: (row.systemCapacity || row.KW || row.kw) ? String(row.systemCapacity || row.KW || row.kw) : '0',
        billAmount: row.billAmount ? Number(row.billAmount) : 0,
        notes: row.notes || undefined,
        uploadSource: req.body.bdeId ? 'bde_manual' : 'admin_manual',
        assignedBde: req.body.bdeId ? req.body.bdeId : undefined,
        status: req.body.bdeId ? 'RAW' : 'New',
        history: [{ action: 'Manually created by BDE (Bulk Upload)' }],
      });
    }

    if (!leads.length)
      return res.status(400).json({ success: false, message: 'No valid leads found', errors });

    let insertedCount = 0;
    try {
      console.log("Attempting to insert:", leads.length, "leads");
      console.log("First lead:", leads[0]);
      const inserted = await Lead.insertMany(leads, { ordered: false });
      console.log("Successfully inserted:", inserted.length);
      insertedCount = inserted.length;
    } catch (bulkErr) {
      if (bulkErr.code === 11000 || bulkErr.name === 'BulkWriteError') {
        insertedCount = bulkErr.insertedDocs ? bulkErr.insertedDocs.length : 0;
        errors.push(`${leads.length - insertedCount} leads were skipped due to duplicate mobile numbers.`);
        console.log("--- SKIPPED DUPLICATES ---", `${leads.length - insertedCount} duplicates found!`);
      } else {
        console.error("INNER CATCH ERROR:", bulkErr);
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
    console.error('==== OUTER CATCH uploadLeads error ====', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
export const getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, country } = req.query;
    const matchStage = { isActive: true };

    if (country) {
      matchStage.country = country;
    }

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
import EpcPartner from '../models/EpcPartner.js';

export const convertLeadToProject = async (req, res) => {
  try {
    const leadId = req.params.id;
    const { epcCalendarSlotId } = req.body || {};
    
    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    
    if (lead.convertedProjectId) {
      lead.status = 'Converted';
      lead.bdeMovedToOrderJourney = true;
      await lead.save();
      return res.status(200).json({ success: true, message: 'Lead auto-converted successfully', projectId: lead.convertedProjectId });
    }

    let projectType = lead.solarType || 'residential';
    const searchCountry = (lead.country || 'india').toLowerCase().trim();
    const isAU = searchCountry === 'australia' || searchCountry === 'au';

    if (isAU) {
      if (projectType === 'au-solar-battery') projectType = 'solar-battery';
      else if (['au-small-home', 'au-standard-family', 'au-large-home', 'au-ev-owners'].includes(projectType)) {
        projectType = 'residential';
      }
      const validAUProjectTypes = ["residential", "commercial", "solar-battery", "farm-rural", "community-strata"];
      if (!validAUProjectTypes.includes(projectType)) {
        projectType = 'residential';
      }
    } else {
      if (projectType === 'surya-ghar') projectType = 'residential';
      const validINProjectTypes = ["residential", "commercial", "group", "common-meter"];
      if (!validINProjectTypes.includes(projectType)) {
        projectType = 'residential';
      }
    }

    const { findJourneySettings, mapJourneyStepsToProjectSteps } = await import('../utils/stepEngine.js');
    const journeySettings = await findJourneySettings(lead.country, lead.state, lead.district);
    const journey = journeySettings?.journeys?.find(j => j.projectType === projectType && j.enabled);
    
    let steps = [];
    if (journeySettings && journey) {
      steps = mapJourneyStepsToProjectSteps(journey.steps);
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
        assignedEpc = slot.epcPartner;
      }
    }

    const isCustomerSelect = journey?.epcSelectionType === 'CUSTOMER_SELECT';

    if (steps.length > 0) {
      steps[0].status = 'in-progress';
      steps[0].startedAt = new Date();
    }

    // Clean up any temporary/placeholder project applications (status: 'lead') created by the customer from the portal
    // This prevents duplicate projects showing up in the Customer Portal once the lead is fully converted.
    const { ProjectOrder } = await import("../models/ProjectModel.js");
    await ProjectOrder.deleteMany({ customerMobile: lead.mobile, status: 'lead' });

    let po = await ProjectOrder.findOne({ customerMobile: lead.mobile });
    if (!po) {
      po = new ProjectOrder({
        customerName: lead.name,
        customerMobile: lead.mobile,
        customerEmail: lead.email,
        projectType,
        systemSizeKW: parseFloat(lead.kw) || parseFloat(lead.systemKw) || parseFloat(lead.systemCapacity) || 1,
        monthlyBillAmount: lead.billAmount || 0,
        state: lead.state || '',
        location: { district: lead.district || lead.city || 'Unknown', address: lead.address, pincode: lead.pincode },
        steps,
        currentStepNumber: steps.length > 0 ? steps[0].stepNumber : 1,
        currentStepTitle: steps.length > 0 ? steps[0].title : 'Project Started',
        completionPercentage: 0,
        status: isAU ? 'awaiting-admin-confirmation' : 'Enquiry Created',
        assignedBde: lead.assignedBde,
        assignedEPCId: assignedEpc ? assignedEpc.toString() : null,
        preferredInstallDate: installationDate,
        bdeRecommendationStatus: isCustomerSelect ? 'pending' : 'accepted',
        pendingActionAlert: isAU ? 'Waiting for Admin Confirmation' : (isCustomerSelect ? 'BDE is selecting top certified installers for you' : 'Waiting for FCFS EPC Partner to claim order...'),
        pendingActionFor: isAU ? 'admin' : (isCustomerSelect ? 'bde' : 'epc-partner')
      });
    }
    
    
    // ?????? Dynamic Payment Stages Initialization ??????
    try {
      const CustomerPaymentSettings = (await import("../models/CustomerPaymentSettings.js")).default;
      let searchCountry = (po.country || "india").toLowerCase().trim();
      if (searchCountry === "au") searchCountry = "australia";
      if (searchCountry === "in") searchCountry = "india";

      const adminPaymentDoc = await CustomerPaymentSettings.findOne({ country: searchCountry });
      const adminConfig = adminPaymentDoc?.projectConfigs?.find(c => c.projectType.toLowerCase() === po.projectType.toLowerCase());

      po.stagePayments = [];
      if (adminConfig && adminConfig.paymentStages && adminConfig.paymentStages.length > 0) {
        const totalCost = po.totalProjectCost || 0;
        for (const stage of adminConfig.paymentStages) {
          let value = stage.defaultValue || 0;
          if (value > stage.maxLimit) value = stage.maxLimit;
          let calculatedAmount = stage.valueType === "fixed" ? value : Math.round(totalCost * (value / 100));

          po.stagePayments.push({
            stageKey: stage.stageKey,
            label: stage.label,
            valueType: stage.valueType,
            value: value,
            amount: calculatedAmount,
            status: "not_required",
            isMandatory: !!stage.isMandatory,
            recipientType: stage.recipientType || "epc",
            gatewayRequired: stage.gatewayRequired !== false,
            razorpayOrderId: "",
            razorpayPaymentId: "",
            razorpaySignature: "",
            paidAt: null
          });
        }
      }
    } catch (err) {
      console.error("Error initializing stagePayments:", err);
    }
    // ?????????????????????????????????????????????????????????????????????????????????????????

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

    let enquiry = await EpcEnquiry.findOne({ customerMobile: po.customerMobile });
    if (!enquiry) {
      enquiry = new EpcEnquiry({
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
        status: isCustomerSelect ? 'Lead' : 'Open For EPC',
        assignmentType: isCustomerSelect ? 'CustomerSelect' : 'FirstComeFirstServe',
        orderNumber: po.orderNumber
      });
      await enquiry.save();
    }

    lead.status = 'Converted';
    lead.convertedProjectId = po._id;
    lead.bdeMovedToOrderJourney = true;
    lead.history.push({ action: 'Converted to Project', date: new Date() });
    // Removed dead code block for duplicate ProjectOrder creation
    await lead.save();

    // Accrue Freelancer BDE earnings & update conversion stats
    if (lead.assignedBde) {
      try {
        const { BDE } = await import('../models/BDEModel.js');
        const bde = await BDE.findById(lead.assignedBde);
        if (bde) {
          if (!bde.performance) bde.performance = { leadsAcquired: 0, leadsConverted: 0 };
          bde.performance.leadsConverted = (bde.performance.leadsConverted || 0) + 1;
          
          if (bde.bdeType === 'Freelancer' && bde.freelancerSettings) {
            const commType = bde.freelancerSettings.commissionType;
            const commAmt = bde.freelancerSettings.commissionAmount || 0;
            let earned = 0;
            if (commType === 'Fixed') {
              earned = commAmt;
            } else if (commType === 'PerKW' || commType === 'Per KW' || commType === 'Percentage') {
              const systemKw = po.systemSizeKW || lead.systemKw || 3;
              earned = systemKw * commAmt;
            }
            bde.freelancerSettings.totalEarnings = (bde.freelancerSettings.totalEarnings || 0) + earned;
          }
          await bde.save();
        }
      } catch (bdeErr) {
        console.error('Error updating BDE earnings:', bdeErr);
      }
    }

    res.json({ success: true, message: 'Lead converted successfully', projectOrder: po });
  } catch (error) {
    console.error('convertLeadToProject error:', error);
    import('fs').then(fs => fs.writeFileSync('convert_error.txt', error.stack));
    res.status(500).json({ success: false, message: 'Server Error during conversion: ' + error.message });
  }
};

// ????????? GET LEADS HIERARCHY ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
export const getLeadsHierarchy = async (req, res) => {
  try {
    const leads = await Lead.find({ status: { $ne: 'Converted' } }).sort({ createdAt: -1 });

    const hierarchy = {};

    leads.forEach(lead => {
      const country = (lead.country || 'India').toUpperCase();
      const projectType = lead.solarType || lead.project || 'Residential Solar';
      const district = lead.district || 'Unassigned District';

      if (!hierarchy[country]) hierarchy[country] = {};
      if (!hierarchy[country][projectType]) hierarchy[country][projectType] = {};
      if (!hierarchy[country][projectType][district]) hierarchy[country][projectType][district] = [];

      hierarchy[country][projectType][district].push(lead);
    });

    // Format for frontend array consumption if needed, or send as object
    res.json({ success: true, hierarchy });
  } catch (error) {
    console.error("Hierarchy error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const fixDistricts = async (req, res) => {
  try {
    const { ProjectOrder } = await import("../models/ProjectModel.js");
    const docs = await ProjectOrder.find({ "location.district": { $in: [null, "", undefined] } });
    let count = 0;
    for (const d of docs) {
      const l = await Lead.findOne({ convertedProjectId: d._id });
      if (l) {
        d.location = d.location || {};
        d.location.district = l.district || l.city || 'Unknown';
        await d.save();
        count++;
      } else {
        d.location = d.location || {};
        d.location.district = 'Unknown';
        await d.save();
        count++;
      }
    }
    res.json({ success: true, message: "Fixed " + count + " projects!" });
  } catch(e) {
    res.json({ success: false, message: e.message });
  }
};

export const fixPayments = async (req, res) => {
  try {
    const { ProjectOrder } = await import("../models/ProjectModel.js");
    const CustomerPaymentSettings = (await import("../models/CustomerPaymentSettings.js")).default;
    const docs = await ProjectOrder.find();
    let count = 0;
    for (const po of docs) {
      if (!po.stagePayments || po.stagePayments.length === 0) {
        let searchCountry = (po.country || "india").toLowerCase().trim();
        if (searchCountry === "au") searchCountry = "australia";
        if (searchCountry === "in") searchCountry = "india";

        const adminPaymentDoc = await CustomerPaymentSettings.findOne({ country: searchCountry });
        if (adminPaymentDoc) {
          const adminConfig = adminPaymentDoc.projectConfigs?.find(c => c.projectType.toLowerCase() === po.projectType.toLowerCase());
          if (adminConfig && adminConfig.paymentStages && adminConfig.paymentStages.length > 0) {
            const totalCost = po.totalProjectCost || 0;
            po.stagePayments = [];
            for (const stage of adminConfig.paymentStages) {
              let value = stage.defaultValue || 0;
              if (value > stage.maxLimit) value = stage.maxLimit;
              let calculatedAmount = stage.valueType === "fixed" ? value : Math.round(totalCost * (value / 100));

              po.stagePayments.push({
                stageKey: stage.stageKey,
                label: stage.label,
                valueType: stage.valueType,
                value: value,
                amount: calculatedAmount,
                status: "not_required",
                isMandatory: !!stage.isMandatory,
                recipientType: stage.recipientType || "epc",
                gatewayRequired: stage.gatewayRequired !== false
              });
            }
            await po.save();
            count++;
          }
        }
      }
    }
    res.json({ success: true, message: "Fixed payments for " + count + " projects!" });
  } catch(e) {
    res.json({ success: false, message: e.message });
  }
};


export const getEpcCalendarForLead = async (req, res) => {
  try {
    let district = req.query.district || req.query.city;
    if (req.params.id !== 'public') {
      const lead = await Lead.findById(req.params.id);
      if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
      district = lead.district || lead.city || district;
    }
    const startDate = new Date();
    startDate.setHours(0,0,0,0);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 45);

    const queryFilter = { date: { $gte: startDate, $lte: endDate } };
    if (district) {
      queryFilter.district = { $regex: new RegExp(district, 'i') };
    }
    // EpcCalendar is already imported at top of file as EpcCalendar (from EpcCalender.js)
    const calendarEntries = await EpcCalendar.find(queryFilter).populate('epcPartner', 'companyName rating contactPerson').sort({ date: 1 });
    const epcCount = await EpcPartner.countDocuments({ isActive: true });

    const dayAvailabilityMap = {};
    const d = new Date(startDate);
    while (d <= endDate) {
      const dateStr = d.toISOString().split('T')[0];
      const dayEntries = calendarEntries.filter(e => e.date && e.date.toISOString().split('T')[0] === dateStr);
      
      const isBlockedOrFull = dayEntries.length > 0 && dayEntries.every(e => e.isBlocked || e.currentBookings >= e.maxBookings);
      
      dayAvailabilityMap[dateStr] = {
        date: dateStr,
        isFullyBooked: isBlockedOrFull,
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

export const requestDateOtp = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    const { email, phone } = req.body;
    
    const targetEmail = email || lead.email;
    const targetPhone = phone || lead.mobile;
    
    if (!targetEmail && !targetPhone) return res.status(400).json({ success: false, message: 'Customer email or phone is required' });
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    if (phone) lead.mobile = targetPhone;
    if (email) lead.email = targetEmail; 
    
    lead.installDateOtp = otp;
    lead.installDateOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await lead.save();
    
    const target = phone ? targetPhone : targetEmail;
    console.log('\n======================================================');
    console.log(`[BDE DATE SET OTP] Generated for ${target}: ${otp}`);
    console.log('======================================================\n');
    
    // Send OTP live via bulksms / email
    if (phone) {
      try {
        await sendOTP(targetPhone, otp);
      } catch (smsErr) {
        console.warn('[SMS GATEWAY WARNING] Live SMS failed, using console OTP:', smsErr.message);
      }
    } else if (targetEmail) {
      try {
        await sendOtpEmail(targetEmail, otp);
      } catch (emErr) {
        console.warn('[EMAIL GATEWAY WARNING] Live Email failed, using console OTP:', emErr.message);
      }
    }
    
    res.json({ success: true, message: `OTP sent to ${target}`, dummyOtp: otp });
  } catch (error) {
    console.error('[OTP] requestDateOtp error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyDateOtp = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    const { otp } = req.body;
    
    console.log(`[OTP] Verifying: submitted=${otp}, stored=${lead.installDateOtp}, expiry=${lead.installDateOtpExpiry}`);
    
    if (String(lead.installDateOtp) !== String(otp)) {
      return res.status(400).json({ success: false, message: `Invalid OTP. Please check the OTP shown in the alert.` });
    }
    if (new Date() > new Date(lead.installDateOtpExpiry)) {
      return res.status(400).json({ success: false, message: 'OTP expired. Please resend.' });
    }
    
    // Use updateOne to avoid triggering full model validation on save
    await Lead.updateOne(
      { _id: lead._id },
      { $unset: { installDateOtp: 1, installDateOtpExpiry: 1 } }
    );
    console.log(`[OTP] Verified successfully for lead ${lead._id}`);
    res.json({ success: true, message: 'OTP verified' });
  } catch (error) {
    console.error('[OTP] verifyDateOtp error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const attemptAutoConversion = async (lead) => {
  try {
    const isAU = lead.country?.toLowerCase() === 'australia' || lead.currency === 'AUD';
    
    const hasDate = lead.isInstallDateFixed || lead.preferredInstallDate;
    const hasEPC = lead.assignedEpc || lead.assignedEPCName;
    if (hasDate && hasEPC && lead.status !== 'Converted') {
      console.log(`Auto-converting lead ${lead._id}...`);
      if (lead.convertedProjectId) {
         lead.status = 'Converted';
         lead.bdeMovedToOrderJourney = true;
         await lead.save();
         console.log(`Lead ${lead._id} directly updated to Converted.`);
      } else {
         const fetchFn = global.fetch;
         const baseUrl = process.env.VITE_API_BASE_URL || 'http://localhost:4005';
         fetchFn(`${baseUrl}/api/leads/${lead._id}/convert`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' }
         }).then(r => r.json()).then(data => console.log("Auto Convert Response:", data)).catch(e => console.error("Auto Convert Error:", e));
      }
    }
  } catch (err) {
    console.error("Auto conversion error:", err);
  }
};


export const selectInstallDate = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    
    const { date, epcCalendarSlotId } = req.body;
    if (!date) return res.status(400).json({ success: false, message: 'Date is required' });

    lead.preferredInstallDate = new Date(date);
    lead.finalInstallDate = new Date(date);
    lead.isInstallDateFixed = true;
    
    if (epcCalendarSlotId) {
      const slot = await EpcCalendar.findById(epcCalendarSlotId).populate('epcPartner');
      if (slot && slot.epcPartner) {
        lead.assignedEpc = slot.epcPartner._id;
        lead.assignedEPCName = slot.epcPartner.companyName;
        slot.currentBookings += 1;
        await slot.save();
      }
    }
    
    await lead.save();
    attemptAutoConversion(lead);
    
    res.json({ success: true, message: 'Installation date selected' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
