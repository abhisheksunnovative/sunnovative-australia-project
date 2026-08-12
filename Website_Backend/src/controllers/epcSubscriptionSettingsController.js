import EpcPlan from '../models/EpcPlan.js';
import EpcKwPackage from '../models/EpcKwPackage.js';
import EpcInstallerConfig from '../models/EpcInstallerConfig.js';

// --- EpcPlan CRUD ---
export const getPlans = async (req, res) => {
  try {
    const { country } = req.query;
    const filter = country ? { country: new RegExp(country, 'i') } : {};
    const plans = await EpcPlan.find(filter);
    res.json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPlan = async (req, res) => {
  try {
    const plan = new EpcPlan(req.body);
    await plan.save();
    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const plan = await EpcPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!plan) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePlan = async (req, res) => {
  try {
    const plan = await EpcPlan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- EpcKwPackage CRUD ---
export const getKwPackages = async (req, res) => {
  try {
    const { country } = req.query;
    const filter = country ? { country: new RegExp(country, 'i') } : {};
    const packages = await EpcKwPackage.find(filter);
    res.json({ success: true, data: packages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createKwPackage = async (req, res) => {
  try {
    const pkg = new EpcKwPackage(req.body);
    await pkg.save();
    res.status(201).json({ success: true, data: pkg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateKwPackage = async (req, res) => {
  try {
    const pkg = await EpcKwPackage.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!pkg) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: pkg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteKwPackage = async (req, res) => {
  try {
    const pkg = await EpcKwPackage.findByIdAndDelete(req.params.id);
    if (!pkg) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- EpcInstallerConfig CRUD ---
export const getInstallerConfigs = async (req, res) => {
  try {
    const { country } = req.query;
    const filter = country ? { country: new RegExp(country, 'i') } : {};
    const configs = await EpcInstallerConfig.find(filter);
    res.json({ success: true, data: configs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createInstallerConfig = async (req, res) => {
  try {
    const config = new EpcInstallerConfig(req.body);
    await config.save();
    res.status(201).json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateInstallerConfig = async (req, res) => {
  try {
    const config = await EpcInstallerConfig.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!config) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteInstallerConfig = async (req, res) => {
  try {
    const config = await EpcInstallerConfig.findByIdAndDelete(req.params.id);
    if (!config) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
