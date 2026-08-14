import Brand from "../models/Brand.js";

export const getBrands = async (req, res) => {
  try {
    const { country, products, projectType, isActive } = req.query;
    const filter = {};
    if (country) {
      const cLower = country.toLowerCase();
      // Handle both full names and country codes (e.g. australia or au)
      let codes = [cLower];
      if (cLower === 'australia') codes.push('au');
      if (cLower === 'india') codes.push('in');
      if (cLower === 'new_zealand') codes.push('nz');
      
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { country: { $in: codes } },
          // If country array doesn't exist, we probably shouldn't show it for a specific country request
          // But to be safe and backward compatible with old data, you might want to uncomment the below:
          // { country: { $size: 0 } },
          // { country: { $exists: false } }
        ]
      });
    }
    
    if (products) {
      if (Array.isArray(products)) {
        filter.products = { $in: products };
      } else {
        filter.products = products;
      }
    }
    
    if (projectType) {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { projectTypes: { $in: [new RegExp(`^${projectType}$`, 'i')] } },
          { projectTypes: { $size: 0 } }, 
          { projectTypes: { $exists: false } }
        ]
      });
    }
    
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const brands = await Brand.find(filter).sort({ name: 1 });
    res.json({ success: true, data: brands });
  } catch (error) {
    console.error("Error fetching brands:", error);
    res.status(500).json({ success: false, message: "Failed to fetch brands" });
  }
};

export const createBrand = async (req, res) => {
  try {
    const { name, products, country, logoUrl, isActive } = req.body;
    const newBrand = new Brand({ name, products, country, logoUrl, isActive });
    await newBrand.save();
    res.status(201).json({ success: true, data: newBrand, message: "Brand created successfully" });
  } catch (error) {
    console.error("Error creating brand:", error);
    res.status(500).json({ success: false, message: "Failed to create brand" });
  }
};

export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBrand = await Brand.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedBrand) {
      return res.status(404).json({ success: false, message: "Brand not found" });
    }
    res.json({ success: true, data: updatedBrand, message: "Brand updated successfully" });
  } catch (error) {
    console.error("Error updating brand:", error);
    res.status(500).json({ success: false, message: "Failed to update brand" });
  }
};

export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBrand = await Brand.findByIdAndDelete(id);
    if (!deletedBrand) {
      return res.status(404).json({ success: false, message: "Brand not found" });
    }
    res.json({ success: true, message: "Brand deleted successfully" });
  } catch (error) {
    console.error("Error deleting brand:", error);
    res.status(500).json({ success: false, message: "Failed to delete brand" });
  }
};
