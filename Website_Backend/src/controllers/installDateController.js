import { ProjectOrder } from '../models/ProjectModel.js';
import Notification from '../models/Notification.js';

// Helper to create a notification
const sendNotification = async (role, recipientId, title, message, link) => {
  try {
    await Notification.create({
      role,
      recipientId,
      title,
      message,
      link,
      isRead: false
    });
  } catch (error) {
    console.error("Failed to send notification:", error);
  }
};

// @desc    BDE proposes an installation date
// @route   POST /api/install-date/:id/propose
// @access  BDE / Admin
export const proposeDate = async (req, res) => {
  try {
    const { id } = req.params;
    const { proposedDate } = req.body;

    const project = await ProjectOrder.findById(id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    if (!project.assignedEPCId) {
      return res.status(400).json({ success: false, message: 'Assign an EPC before proposing a date' });
    }

    project.installDateNegotiation = {
      ...project.installDateNegotiation,
      proposedDateByBde: new Date(proposedDate),
      epcStatus: 'pending',
      epcNote: '',
      epcProposedAlternateDate: null,
      customerStatus: 'pending',
      customerNote: '',
      customerProposedAlternateDate: null,
      isFinalized: false,
      finalInstallationDate: null
    };

    await project.save();

    // Notify EPC
    await sendNotification(
      'EpcPartner', 
      project.assignedEPCId, 
      'New Installation Date Proposed', 
      `BDE has proposed a new installation date for project ${project.orderNumber}. Please review and accept/reject.`,
      `/epc/order/${id}`
    );

    // Notify Customer
    if (project.customerId) {
      await sendNotification(
        'Customer', 
        project.customerId, 
        'New Installation Date Proposed', 
        `We have proposed a new installation date for your solar project. Please review and accept/reject.`,
        `/portal/project/${id}`
      );
    }

    res.json({ success: true, message: 'Date proposed successfully', project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    EPC or Customer responds to the proposed date
// @route   POST /api/install-date/:id/respond
// @access  EPC / Customer
export const respondToDate = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, status, note, alternateDate } = req.body; // role: 'epc' or 'customer'

    const project = await ProjectOrder.findById(id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    if (!project.installDateNegotiation) {
      project.installDateNegotiation = {};
    }

    let actorName = "";

    if (role === 'epc') {
      project.installDateNegotiation.epcStatus = status;
      project.installDateNegotiation.epcNote = note || '';
      project.installDateNegotiation.epcProposedAlternateDate = alternateDate ? new Date(alternateDate) : null;
      actorName = "EPC Partner";
    } else if (role === 'customer') {
      project.installDateNegotiation.customerStatus = status;
      project.installDateNegotiation.customerNote = note || '';
      project.installDateNegotiation.customerProposedAlternateDate = alternateDate ? new Date(alternateDate) : null;
      actorName = "Customer";
    } else {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    await project.save();

    // Notify BDE about the response
    if (project.assignedBde) {
      const responseText = status === 'accepted' ? 'accepted' : `rejected with note: "${note}"`;
      await sendNotification(
        'BDE', 
        project.assignedBde, 
        `Installation Date Response`, 
        `${actorName} has ${responseText} the proposed installation date for ${project.orderNumber}.`,
        `/bde/projects/${id}`
      );
    }
    
    // Also notify general Admins
    await sendNotification(
      'Admin', 
      null, 
      `Installation Date Response`, 
      `${actorName} has ${status} the proposed installation date for ${project.orderNumber}.`,
      `/admin/projects/${id}`
    );

    res.json({ success: true, message: 'Response recorded successfully', project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    BDE fixes the final installation date
// @route   POST /api/install-date/:id/fix
// @access  BDE / Admin
export const fixFinalDate = async (req, res) => {
  try {
    const { id } = req.params;
    const { finalDate } = req.body;

    const project = await ProjectOrder.findById(id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    if (!project.installDateNegotiation) {
      project.installDateNegotiation = {};
    }

    project.installDateNegotiation.isFinalized = true;
    project.installDateNegotiation.finalInstallationDate = new Date(finalDate);
    project.isInstallDateFixed = true;
    project.preferredInstallDate = new Date(finalDate); // Sync with old field for backwards compatibility

    await project.save();

    // Notify EPC
    if (project.assignedEPCId) {
      await sendNotification(
        'EpcPartner', 
        project.assignedEPCId, 
        'Installation Date Finalized', 
        `Your installation is fixed on ${new Date(finalDate).toLocaleDateString()} for project ${project.orderNumber}.`,
        `/epc/order/${id}`
      );
    }

    // Notify Customer
    if (project.customerId) {
      await sendNotification(
        'Customer', 
        project.customerId, 
        'Installation Date Finalized', 
        `Great news! Your solar installation date has been firmly scheduled for ${new Date(finalDate).toLocaleDateString()}.`,
        `/portal/project/${id}`
      );
    }

    res.json({ success: true, message: 'Final installation date fixed successfully', project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
