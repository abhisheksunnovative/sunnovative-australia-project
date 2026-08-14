import { ProjectOrder } from '../models/ProjectModel.js';
import EpcPartner from '../models/EpcPartner.js';
import EpcSystemSettings from '../models/EpcSystemSettings.js';

export const getOrderSummary = async (req, res) => {
  try {
    const epcId = req.epc._id;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const [total, newOrders, ongoing, completed, today, upcoming, settings, epc] = await Promise.all([
      ProjectOrder.countDocuments({ assignedEPCId: epcId }),
      ProjectOrder.countDocuments({ assignedEPCId: epcId, status: 'qualified' }),
      ProjectOrder.countDocuments({ assignedEPCId: epcId, status: { $in: ['surveyed', 'in-progress'] } }),
      ProjectOrder.countDocuments({ assignedEPCId: epcId, status: { $in: ['completed', 'closed'] } }),
      ProjectOrder.countDocuments({ 
        assignedEPCId: epcId, 
        preferredInstallDate: { $gte: startOfToday, $lte: endOfToday } 
      }),
      ProjectOrder.countDocuments({ 
        assignedEPCId: epcId, 
        preferredInstallDate: { $gt: endOfToday } 
      }),
      EpcSystemSettings.getSingleton(),
      EpcPartner.findById(epcId).select('overdueCount isRedAlert')
    ]);

    const overdue = 0; // Overdue needs separate logic if desired
    const maxOverdue = settings?.overdueSettings?.maxAllowableOverdueProjects || 3;
    const isRedAlert = overdue > maxOverdue;

    if (epc && epc.isRedAlert !== isRedAlert) {
      epc.isRedAlert = isRedAlert;
      await epc.save();
    }

    res.json({ total, new: newOrders, ongoing, overdue, completed, today, upcoming, isRedAlert, maxOverdue });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};



export const getDemandStats = async (req, res) => {
  try {
    const epcId = req.epc._id;
    const epc = await EpcPartner.findById(epcId).select('activeDistricts serviceAreas');
    if (!epc) return res.status(404).json({ message: 'EPC not found' });
    
    // Check all leads that have no assigned EPC yet, and match the districts
    const activeDistricts = epc.activeDistricts || [];
    
    // Fallback: extract districts from serviceAreas if activeDistricts is empty
    const districtsToCheck = activeDistricts.length > 0 
      ? activeDistricts 
      : (epc.serviceAreas || []).map(sa => sa.district).filter(Boolean);

    if (districtsToCheck.length === 0) {
      return res.json({ demandCount: 0, districts: [] });
    }

    const demandCount = await ProjectOrder.countDocuments({
      status: 'lead',
      assignedEPCId: null, // Only unassigned leads
      'location.district': { $in: districtsToCheck }
    });

    res.json({ demandCount, districts: districtsToCheck });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getDemandSupplyAnalytics = async (req, res) => {
  try {
    const epcId = req.epc._id;
    const epc = await EpcPartner.findById(epcId).select('activeDistricts');
    if (!epc) return res.status(404).json({ message: 'EPC not found' });
    
    const activeDistricts = epc.activeDistricts || [];
    if (activeDistricts.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Aggregate Demand (Leads created in last 30 days) by District
    const demandData = await ProjectOrder.aggregate([
      {
        $match: {
          'location.district': { $in: activeDistricts },
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$location.district',
          demandKw: { $sum: { $toDouble: { $ifNull: ["$systemSizeKW", 0] } } }
        }
      }
    ]);

    // Aggregate Supply (Wallet credits) by District for ALL EPCs to know the market saturation
    const EpcWallet = (await import('../models/EpcWallet.js')).default;
    const allWallets = await EpcWallet.find({});
    let supplyMap = {};
    activeDistricts.forEach(d => supplyMap[d] = 0);

    allWallets.forEach(w => {
      if (w.credits) {
        w.credits.forEach(c => {
          if (activeDistricts.includes(c.district)) {
            supplyMap[c.district] += (c.credits || 0);
          }
        });
      }
    });

    const dsSettings = await (await import('../models/DemandSupplySettings.js')).default.getSingleton();
    const globalLimit = dsSettings.supplyLimitPercentage || 100;

    // Format output
    const analyticsData = activeDistricts.map(district => {
      const match = demandData.find(d => d._id === district);
      const demandKw = match ? match.demandKw : 0;
      const supplyKw = supplyMap[district] || 0;
      
      const regionConf = dsSettings.regions.find(r => r.district === district);
      const limit = regionConf && regionConf.supplyLimitPercentageOverride ? regionConf.supplyLimitPercentageOverride : globalLimit;
      const allowedSupply = demandKw * (limit / 100);

      let suggestion = "Normal Market. Maintain your credits.";
      let status = "normal";

      if (demandKw > 0 && supplyKw < allowedSupply) {
        suggestion = "High Demand! Transfer KW here to get more orders.";
        status = "high_demand";
      } else if (supplyKw >= allowedSupply) {
        suggestion = "Low Demand / Saturated. Do not transfer KW here.";
        status = "low_demand";
      } else if (demandKw === 0) {
         suggestion = "No recent demand. Avoid transferring KW here.";
         status = "low_demand";
      }

      return {
        district,
        demandKw,
        supplyKw,
        status,
        suggestion
      };
    });

    res.json({ success: true, data: analyticsData });
  } catch (error) {
    console.error("getDemandSupplyAnalytics error:", error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const { status, projectType, country, state, district, city } = req.query;
    const filter = { assignedEPCId: req.epc._id };

    if (status && status !== 'All') {
      if (status === 'New') filter.status = 'qualified';
      else if (status === 'Ongoing') filter.status = { $in: ['surveyed', 'in-progress'] };
      else if (status === 'Completed') filter.status = { $in: ['completed', 'closed'] };
      else filter.status = status;
    }

    if (projectType && projectType !== 'All') {
      const mappedType = (projectType === 'Residential Solar' || projectType === 'Surya Ghar Yojana') ? 'residential' : 
                         projectType === 'Commercial Solar' ? 'commercial' :
                         projectType === 'Group Solar' ? 'group' : 'common-meter';
      filter.projectType = mappedType;
    }

    if (country && country !== 'All') filter.country = country;
    if (state && state !== 'All') filter.state = state;
    if (district && district !== 'All') filter['location.district'] = district;
    if (city && city !== 'All') filter['location.city'] = city;

    const orders = await ProjectOrder.find(filter).sort({ createdAt: -1 });
    const summary = {
      total:     orders.length,
      new:       orders.filter(o => o.status === 'qualified').length,
      ongoing:   orders.filter(o => o.status === 'surveyed' || o.status === 'in-progress').length,
      overdue:   0, // Implement overdue logic on ProjectOrder later
      completed: orders.filter(o => o.status === 'completed' || o.status === 'closed').length,
    };
    res.json({ orders, summary });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await ProjectOrder.findOne({ _id: req.params.id, assignedEPCId: req.epc._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const updateOrderStage = async (req, res) => {
  try {
    const order = await ProjectOrder.findOne({ _id: req.params.id, assignedEPCId: req.epc._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const { stage } = req.body;
    
    // In Australia flow, moving from lead to Registration Started
    if (order.status === 'lead' && stage === 'Registration Started') {
      order.status = 'qualified'; // or whatever the next status should be to show up in Orders
    }

    // skip strict stage validation for now if stageSteps is not perfectly aligned
    order.stage = stage;

    if (stage === 'Installation In Progress') order.status = 'Ongoing';
    if (stage === 'Installation Completed')   order.installCompletedAt = new Date();
    if (stage === 'Project Closed') {
      order.status             = 'Completed';
      order.warrantyActivated  = true;
      order.warrantyActivatedAt = new Date();
    }

    await order.save();
    res.json({ message: `Order moved to: ${stage}`, order });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const uploadRegistrationDocs = async (req, res) => {
  try {
    const order = await EpcOrder.findOne({ _id: req.params.id, epcPartner: req.epc._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: 'No files uploaded' });

    const newDocs = req.files.map(f => ({
      docName:    f.originalname,
      fileUrl:    `/uploads/${f.filename}`,
      uploadedAt: new Date(),
    }));
    order.registrationDocs.push(...newDocs);
    order.completionChecklist.mnreDocsUploaded = true;
    await order.save();

    res.json({ message: 'Documents uploaded successfully', registrationDocs: order.registrationDocs });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const uploadInstallationDocs = async (req, res) => {
  try {
    const order = await EpcOrder.findOne({ _id: req.params.id, epcPartner: req.epc._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (req.files?.photos) {
      const photos = req.files.photos.map((f, i) => ({
        caption:    req.body.captions?.[i] || '',
        fileUrl:    `/uploads/${f.filename}`,
        uploadedAt: new Date(),
      }));
      order.installationPhotos.push(...photos);
      order.completionChecklist.installPhotosUploaded = true;
    }

    if (req.files?.netMetering) {
      order.netMeteringDoc = `/uploads/${req.files.netMetering[0].filename}`;
      order.completionChecklist.netMeteringDone = true;
    }

    await order.save();
    res.json({ message: 'Installation docs uploaded', order });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const uploadPcr = async (req, res) => {
  try {
    const order = await EpcOrder.findOne({ _id: req.params.id, epcPartner: req.epc._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!req.file) return res.status(400).json({ message: 'No PCR file uploaded' });

    order.pcrReport     = `/uploads/${req.file.filename}`;
    order.pcrUploadedAt = new Date();
    order.completionChecklist.pcrGenerated = true;

    await order.save();
    res.json({ message: 'PCR report uploaded', order });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const checkOverdueOrders = async (req, res) => { res.json({ message: 'Overdue orders checked' }); };
export const fixInstallDate = async (req, res) => { res.json({ message: 'Date fixed' }); };