import ProductConfig from '../models/ProductConfig.js';

export const getProductConfigs = async (req, res) => {
  try {
    const { country, projectType } = req.query;
    const filter = {};
    if (country) filter.country = country.toLowerCase();
    if (projectType) filter.projectType = projectType;
    
    const configs = await ProductConfig.find(filter);
    res.status(200).json(configs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product configs', error: error.message });
  }
};

export const createProductConfig = async (req, res) => {
  try {
    const config = new ProductConfig(req.body);
    await config.save();
    res.status(201).json(config);
  } catch (error) {
    res.status(400).json({ message: 'Error creating product config', error: error.message });
  }
};

export const updateProductConfig = async (req, res) => {
  try {
    const config = await ProductConfig.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!config) return res.status(404).json({ message: 'Product config not found' });
    res.status(200).json(config);
  } catch (error) {
    res.status(400).json({ message: 'Error updating product config', error: error.message });
  }
};

export const deleteProductConfig = async (req, res) => {
  try {
    const config = await ProductConfig.findByIdAndDelete(req.params.id);
    if (!config) return res.status(404).json({ message: 'Product config not found' });
    res.status(200).json({ message: 'Product config deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product config', error: error.message });
  }
};
