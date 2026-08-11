import ProjectType from "../models/ProjectType.js";

export const getProjectTypes = async (req, res) => {
  try {
    const { country } = req.query;
    const filter = {};
    if (country) filter.country = country.toLowerCase();
    
    const projectTypes = await ProjectType.find(filter);
    res.status(200).json({ success: true, data: projectTypes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProjectType = async (req, res) => {
  try {
    const { country, projectType, projectTypeLabel, availableKw, isActive } = req.body;
    const newProjectType = new ProjectType({
      country,
      projectType,
      projectTypeLabel,
      availableKw,
      isActive
    });
    const saved = await newProjectType.save();
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProjectType = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await ProjectType.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Project Type not found" });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProjectType = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ProjectType.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: "Project Type not found" });
    res.status(200).json({ success: true, message: "Project Type deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
