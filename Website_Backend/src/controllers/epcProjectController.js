import { ProjectOrder } from '../models/ProjectModel.js';

export const getAllProjects = async (req, res) => {
  try {
    const { status, projectType, district, search } = req.query;
    const filter = { assignedEPCId: req.epc._id };

    if (status)       filter.status       = status;
    if (projectType) filter.projectType = projectType;
    if (district)    filter.district    = district;

    if (search) {
      filter.$or = [
        { customerName:  { $regex: search, $options: 'i' } },
        { orderNumber:   { $regex: search, $options: 'i' } },
        { 'location.district': { $regex: search, $options: 'i' } },
      ];
    }

    const projects = await ProjectOrder.find(filter).sort({ createdAt: -1 });

    const statusSummary = {
      'lead': 0,
      'qualified': 0,
      'surveyed': 0,
      'in-progress': 0,
      'completed': 0,
      'closed': 0,
      'cancelled': 0,
      'on-hold': 0,
    };

    projects.forEach(p => {
      if (statusSummary[p.status] !== undefined) {
        statusSummary[p.status]++;
      }
    });

    res.json({ projects, statusSummary, total: projects.length });
  } catch (err) {
    console.error('Get projects error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await ProjectOrder.findOne({
      _id:         req.params.id,
      assignedEPCId: req.epc._id,
    });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    console.error('Get project by id error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const completeStep = async (req, res) => {
  try {
    const { stepId, note } = req.body;
    
    const project = await ProjectOrder.findOne({
      _id: req.params.id,
      assignedEPCId: req.epc._id,
    });
    
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const stepIndex = project.steps.findIndex(s => s.stepId === stepId);
    if (stepIndex === -1) return res.status(404).json({ message: 'Step not found' });
    
    if (project.steps[stepIndex].assignedTo !== 'epc-partner') {
      return res.status(403).json({ message: 'Not authorized to complete this step' });
    }

    project.steps[stepIndex].status = 'completed';
    project.steps[stepIndex].completedAt = new Date();
    project.steps[stepIndex].completedBy = req.epc.companyName || 'EPC Partner';
    
    if (note) project.steps[stepIndex].evidenceNote = note;
    
    if (req.file) {
      project.steps[stepIndex].evidenceUrl = `/${req.file.path.replace(/\\/g, '/')}`;
    }

    // Update overall current step
    const nextStep = project.steps.find(s => s.status !== 'completed');
    if (nextStep) {
      project.currentStepNumber = nextStep.stepNumber;
      project.currentStepTitle = nextStep.title;
      project.status = 'in-progress';
    } else {
      project.status = 'completed';
      project.completionPercentage = 100;
    }

    const totalSteps = project.steps.length;
    const completedSteps = project.steps.filter(s => s.status === 'completed').length;
    project.completionPercentage = Math.round((completedSteps / totalSteps) * 100);

    await project.save();
    res.json({ message: `Step completed successfully`, project });
  } catch (err) {
    console.error('Complete step error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const uploadProjectDocs = async (req, res) => {
  try {
    const project = await EpcOrder.findOne({
      _id:         req.params.id,
      epcPartner: req.epc._id,
    });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!req.files || req.files.length === 0) return res.status(400).json({ message: 'No files uploaded' });

    const newDocs = req.files.map(f => ({
      docName:    f.originalname,
      fileUrl:    `/${f.path.replace(/\\/g, '/')}`, 
      uploadedAt: new Date(),
    }));

    project.registrationDocs.push(...newDocs);
    project.completionChecklist.mnreDocsUploaded = true;
    await project.save();

    res.json({ message: 'Documents uploaded', registrationDocs: project.registrationDocs });
  } catch (err) {
    console.error('Upload docs error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const uploadInstallationPhotos = async (req, res) => {
  try {
    const project = await EpcOrder.findOne({
      _id:         req.params.id,
      epcPartner: req.epc._id,
    });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (req.files?.photos) {
      const photos = req.files.photos.map((f, i) => ({
        caption:    req.body.captions ? (Array.isArray(req.body.captions) ? req.body.captions[i] : req.body.captions) : '',
        fileUrl:    `/${f.path.replace(/\\/g, '/')}`,
        uploadedAt: new Date(),
      }));
      project.installationPhotos.push(...photos);
      project.completionChecklist.installPhotosUploaded = true;
      project.completionChecklist.gpsPhotosUploaded     = true; 
    }

    if (req.files?.netMetering) {
      project.netMeteringDoc = `/${req.files.netMetering[0].path.replace(/\\/g, '/')}`;
      project.completionChecklist.netMeteringDone = true;
    }

    if (project.stage === 'Installation In Progress') {
      project.stage = 'Installation Completed';
    }

    await project.save();
    res.json({ message: 'Installation docs uploaded successfully', project });
  } catch (err) {
    console.error('Upload installation error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const uploadPcrReport = async (req, res) => {
  try {
    const project = await EpcOrder.findOne({
      _id:         req.params.id,
      epcPartner: req.epc._id,
    });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!req.file) return res.status(400).json({ message: 'No PCR file uploaded' });

    project.pcrReport     = `/${req.file.path.replace(/\\/g, '/')}`;
    project.pcrUploadedAt = new Date();
    project.stage         = 'QC Verification'; 
    project.completionChecklist.pcrGenerated = true;

    await project.save();
    res.json({ message: 'PCR report uploaded successfully', project });
  } catch (err) {
    console.error('Upload PCR error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};