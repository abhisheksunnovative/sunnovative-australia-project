import EpcBulkUploadSettings from '../models/EpcBulkUploadSettings.js';
import EpcBulkLead from '../models/EpcBulkLead.js';
import EpcPartner from '../models/EpcPartner.js';

// @desc    Get bulk upload settings for a country
// @route   GET /api/epc-bulk/settings
export const getSettings = async (req, res) => {
  try {
    const { country, state = 'All', district = 'All', projectType = 'All', epcCategory = 'All' } = req.query;
    let settings = await EpcBulkUploadSettings.findOne({ country, state, district, projectType, epcCategory });
    
    // Fallbacks if exact not found
    if (!settings && district !== 'All') {
      settings = await EpcBulkUploadSettings.findOne({ country, state, district: 'All', projectType, epcCategory });
    }
    if (!settings && state !== 'All') {
      settings = await EpcBulkUploadSettings.findOne({ country, state: 'All', district: 'All', projectType, epcCategory });
    }
    
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save/Update bulk upload settings
// @route   POST /api/epc-bulk/settings
export const saveSettings = async (req, res) => {
  try {
    const { country, state = 'All', district = 'All', projectType = 'All', epcCategory = 'All', fields } = req.body;
    
    let settings = await EpcBulkUploadSettings.findOne({ country, state, district, projectType, epcCategory });
    
    if (settings) {
      settings.fields = fields;
      await settings.save();
    } else {
      settings = await EpcBulkUploadSettings.create({
        country, state, district, projectType, epcCategory, fields
      });
    }
    
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload bulk leads
// @route   POST /api/epc-bulk/upload
export const uploadLeads = async (req, res) => {
  try {
    const { leads, country } = req.body;
    if (!leads || !Array.isArray(leads)) {
      return res.status(400).json({ success: false, message: 'Invalid data format' });
    }
    
    let imported = 0;
    let duplicates = 0;
    let errors = [];

    for (let i = 0; i < leads.length; i++) {
      const row = leads[i];
      try {
        // Validation checks
        if (!row.email || !row.mobile || !row.companyName) {
          errors.push({ row: i + 1, message: 'Missing mandatory fields (Email, Mobile, or Company Name)' });
          continue;
        }

        // Check if exists in EpcPartner
        const existingPartner = await EpcPartner.findOne({ 
          $or: [{ email: row.email }, { phone: row.mobile }, { gstNumber: row.gstNumber }] 
        });

        if (existingPartner) {
          duplicates++;
          continue;
        }

        // Check if exists in EpcBulkLead
        const existingBulkLead = await EpcBulkLead.findOne({ 
          $or: [{ email: row.email }, { mobile: row.mobile }] 
        });

        if (existingBulkLead) {
          duplicates++;
          continue;
        }

        // Create new EpcBulkLead
        await EpcBulkLead.create({
          ...row,
          country: row.country || country || 'India',
          status: 'Pending'
        });
        imported++;
      } catch (err) {
        errors.push({ row: i + 1, message: err.message });
      }
    }

    res.json({ 
      success: true, 
      imported, 
      duplicates, 
      errors,
      total: leads.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/epc-bulk/stats
export const getDashboardStats = async (req, res) => {
  try {
    const total = await EpcBulkLead.countDocuments();
    const active = await EpcBulkLead.countDocuments({ status: 'Active' });
    const pending = await EpcBulkLead.countDocuments({ status: 'Pending' });
    
    // Aggregate by country
    const countryStats = await EpcBulkLead.aggregate([
      { $group: { _id: "$country", count: { $sum: 1 } } }
    ]);
    
    // Aggregate by State
    const stateStats = await EpcBulkLead.aggregate([
      { $group: { _id: "$state", count: { $sum: 1 } } }
    ]);

    // Aggregate by District
    const districtStats = await EpcBulkLead.aggregate([
      { $group: { _id: "$district", count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        total,
        active,
        pending,
        byCountry: countryStats,
        byState: stateStats,
        byDistrict: districtStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get paginated leads
// @route   GET /api/epc-bulk/leads
export const getLeads = async (req, res) => {
  try {
    const { page = 1, limit = 25, country, state, district, search } = req.query;
    const query = {};
    
    if (country) query.country = country;
    if (state) query.state = state;
    if (district) query.district = district;
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } }
      ];
    }

    const leads = await EpcBulkLead.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
      
    const total = await EpcBulkLead.countDocuments(query);

    res.json({ success: true, data: leads, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
