import { Discom } from "../models/DiscomModel.js";

// Get all Discoms
export const getDiscoms = async (req, res) => {
  try {
    const { country, state, district } = req.query;
    let query = {};
    if (country) query.country = { $regex: new RegExp(`^${country}$`, 'i') };
    if (state) query.state = { $regex: new RegExp(`^${state}$`, 'i') };
    if (district) query.districts = { $elemMatch: { $regex: new RegExp(`^${district}$`, 'i') } };

    const discoms = await Discom.find(query).sort({ name: 1 });
    res.status(200).json({ success: true, data: discoms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new Discom
export const createDiscom = async (req, res) => {
  try {
    const { name, country, state, districts } = req.body;
    
    // Check if exists
    const exists = await Discom.findOne({ name, country, state });
    if (exists) {
      return res.status(400).json({ success: false, message: "Discom with this name already exists in this region." });
    }

    const newDiscom = new Discom({ name, country, state, districts });
    await newDiscom.save();

    res.status(201).json({ success: true, message: "Discom created successfully", data: newDiscom });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Discom
export const updateDiscom = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, country, state, districts, isActive } = req.body;

    const discom = await Discom.findByIdAndUpdate(
      id,
      { name, country, state, districts, isActive },
      { new: true }
    );

    if (!discom) {
      return res.status(404).json({ success: false, message: "Discom not found" });
    }

    res.status(200).json({ success: true, message: "Discom updated successfully", data: discom });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Discom
export const deleteDiscom = async (req, res) => {
  try {
    const { id } = req.params;
    await Discom.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Discom deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
