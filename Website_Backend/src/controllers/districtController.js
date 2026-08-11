import District from "../models/District.js";

export const getStates = async (req, res) => {
  try {
    const { country } = req.query;
    const filter = country ? { country: country.toLowerCase() } : {};
    const states = await District.distinct('state', filter);
    res.status(200).json({ success: true, data: states });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDistricts = async (req, res) => {
  try {
    const { country, state } = req.query;
    const filter = {};
    if (country) filter.country = country.toLowerCase();
    if (state) filter.state = state;
    const districts = await District.find(filter);
    // existing API returned array directly, so keep it for backward compatibility unless we find issues.
    res.status(200).json({ success: true, data: districts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createDistrict = async (req, res) => {
  try {
    const { country, state, district, pincodes, isActive } = req.body;
    let parsedPincodes = [];
    if (typeof pincodes === "string") {
      parsedPincodes = pincodes.split(",").map(p => p.trim()).filter(p => p);
    } else if (Array.isArray(pincodes)) {
      parsedPincodes = pincodes;
    }
    
    const newDistrict = new District({
      country,
      state,
      district,
      pincodes: parsedPincodes,
      isActive
    });
    await newDistrict.save();
    res.status(201).json(newDistrict);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateDistrict = async (req, res) => {
  try {
    const { id } = req.params;
    const { country, state, district, pincodes, isActive } = req.body;
    
    let parsedPincodes;
    if (typeof pincodes === "string") {
      parsedPincodes = pincodes.split(",").map(p => p.trim()).filter(p => p);
    } else if (Array.isArray(pincodes)) {
      parsedPincodes = pincodes;
    }

    const updatedDistrict = await District.findByIdAndUpdate(
      id,
      {
        ...(country && { country }),
        ...(state && { state }),
        ...(district && { district }),
        ...(parsedPincodes && { pincodes: parsedPincodes }),
        ...(isActive !== undefined && { isActive }),
      },
      { new: true }
    );
    res.status(200).json(updatedDistrict);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteDistrict = async (req, res) => {
  try {
    const { id } = req.params;
    await District.findByIdAndDelete(id);
    res.status(200).json({ message: "District deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
