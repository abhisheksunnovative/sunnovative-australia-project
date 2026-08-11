import District from "../models/District.js";

export const getDistricts = async (req, res) => {
  try {
    const { country } = req.query;
    const filter = country ? { country: country.toLowerCase() } : {};
    const districts = await District.find(filter);
    res.status(200).json(districts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createDistrict = async (req, res) => {
  try {
    const { country, district, pincodes, isActive } = req.body;
    let parsedPincodes = [];
    if (typeof pincodes === "string") {
      parsedPincodes = pincodes.split(",").map(p => p.trim()).filter(p => p);
    } else if (Array.isArray(pincodes)) {
      parsedPincodes = pincodes;
    }
    
    const newDistrict = new District({
      country,
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
    const { country, district, pincodes, isActive } = req.body;
    
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
