import QualificationCategory from '../models/QualificationCategory.js';

export const getQualifications = async (req, res) => {
  try {
    const { country, state } = req.query;
    let query = {};
    if (country) query.country = country.toLowerCase();
    if (state && state !== 'All') query.state = state;

    const cats = await QualificationCategory.find(query).sort({ createdAt: -1 });
    res.json(cats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createQualification = async (req, res) => {
  try {
    const newCat = new QualificationCategory(req.body);
    await newCat.save();
    res.status(201).json(newCat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateQualification = async (req, res) => {
  try {
    const cat = await QualificationCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(cat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteQualification = async (req, res) => {
  try {
    await QualificationCategory.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
