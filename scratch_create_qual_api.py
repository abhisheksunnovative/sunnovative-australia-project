import os

controller_code = '''import QualificationCategory from '../models/QualificationCategory.js';

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
'''

routes_code = '''import express from 'express';
import { protectAdmin } from '../middleware/authMiddleware.js';
import {
  getQualifications,
  createQualification,
  updateQualification,
  deleteQualification
} from '../controllers/qualificationController.js';

const router = express.Router();

// Allow public fetch for EPC registration form
router.get('/', getQualifications);

router.post('/', protectAdmin, createQualification);
router.put('/:id', protectAdmin, updateQualification);
router.delete('/:id', protectAdmin, deleteQualification);

export default router;
'''

with open('Website_Backend/src/controllers/qualificationController.js', 'w', encoding='utf-8') as f:
    f.write(controller_code)

with open('Website_Backend/src/routes/qualificationRoutes.js', 'w', encoding='utf-8') as f:
    f.write(routes_code)

print("Qualification Routes and Controllers Created")
