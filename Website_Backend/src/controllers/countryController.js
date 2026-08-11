import Country from "../models/Country.js";

export const getCountries = async (req, res) => {
  try {
    const filter = {};
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }
    const countries = await Country.find(filter).sort({ name: 1 });
    res.json({ success: true, data: countries });
  } catch (error) {
    console.error("Error fetching countries:", error);
    res.status(500).json({ success: false, message: "Failed to fetch countries" });
  }
};

export const createCountry = async (req, res) => {
  try {
    const { name, code, flagEmoji, isActive } = req.body;
    const newCountry = new Country({ name, code: code.toLowerCase(), flagEmoji, isActive });
    await newCountry.save();
    res.status(201).json({ success: true, data: newCountry, message: "Country created successfully" });
  } catch (error) {
    console.error("Error creating country:", error);
    res.status(500).json({ success: false, message: "Failed to create country" });
  }
};

export const updateCountry = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.body.code) {
      req.body.code = req.body.code.toLowerCase();
    }
    const updatedCountry = await Country.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedCountry) {
      return res.status(404).json({ success: false, message: "Country not found" });
    }
    res.json({ success: true, data: updatedCountry, message: "Country updated successfully" });
  } catch (error) {
    console.error("Error updating country:", error);
    res.status(500).json({ success: false, message: "Failed to update country" });
  }
};

export const deleteCountry = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCountry = await Country.findByIdAndDelete(id);
    if (!deletedCountry) {
      return res.status(404).json({ success: false, message: "Country not found" });
    }
    res.json({ success: true, message: "Country deleted successfully" });
  } catch (error) {
    console.error("Error deleting country:", error);
    res.status(500).json({ success: false, message: "Failed to delete country" });
  }
};
