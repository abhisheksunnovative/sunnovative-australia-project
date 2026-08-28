const fs = require('fs');

const func = `
export const cancelOverdueProject = async (req, res) => {
  try {
    const { ProjectOrder } = await import('../models/ProjectModel.js');
    const Lead = (await import('../models/Lead.js')).default || (await import('../models/Lead.js')).Lead;
    
    const projectId = req.params.id;
    const project = await ProjectOrder.findById(projectId);
    
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    if (project.customerId.toString() !== req.customer.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Soft delete: update status to Cancelled
    project.status = 'Cancelled';
    project.history = project.history || [];
    project.history.push({ action: 'Customer cancelled due to overdue installation date selection', date: new Date() });
    await project.save();

    // Soft delete lead if exists
    if (project.leadId) {
      await Lead.findByIdAndUpdate(project.leadId, { 
        status: 'Lost',
        $push: { history: { action: 'Project Cancelled by Customer (Overdue)', date: new Date() } }
      });
    }

    res.json({ success: true, message: 'Project cancelled successfully' });
  } catch (error) {
    console.error('Cancel overdue project error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
`;

fs.appendFileSync('Website_Backend/src/controllers/customerProjectController.js', func);
