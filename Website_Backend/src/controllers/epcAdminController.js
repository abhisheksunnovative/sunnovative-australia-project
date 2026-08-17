import EpcPartner from '../models/EpcPartner.js';

// Get all EPC partners (Admin)
export const getAllEpcs = async (req, res) => {
  try {
    const { country, district, city, isOverdue, projectType } = req.query;
    let query = {};
    const andConditions = [];
    
    if (country && country !== 'All') andConditions.push({ country });
    if (city && city !== 'All') andConditions.push({ city });
    if (projectType && projectType !== 'All') andConditions.push({ qualifiedProjectTypes: projectType });
    
    if (district && district !== 'All') {
      andConditions.push({
        $or: [{ hqLocation: district }, { activeDistricts: district }]
      });
    }
    
    // For Overdue, assuming we filter by overdueCount > 0 or isFrozen
    if (isOverdue === 'true') {
      andConditions.push({
        $or: [{ overdueCount: { $gt: 0 } }, { isFrozen: true }]
      });
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    const epcs = await EpcPartner.find(query).sort({ createdAt: -1 }).select('-password');
    res.status(200).json(epcs);
  } catch (error) {
    console.error('Error fetching EPCs:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update KYC Onboarding Status (Admin)
export const updateKycStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // e.g. 'Verified', 'Rejected', 'Active'
    
    const epc = await EpcPartner.findById(id);
    if (!epc) return res.status(404).json({ message: 'EPC not found' });
    
    epc.onboardingStatus = status;
    // If Admin marks as Active/Verified, we can automatically set isActive = true
    if (status === 'Active' || status === 'Verified') {
       epc.isActive = true;
    }
    
    await epc.save();
    res.status(200).json({ message: 'KYC status updated', epc });
  } catch (error) {
    console.error('Error updating KYC status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Activate / Deactivate EPC (Admin)
export const toggleEpcStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, deactivationReason } = req.body;

    const epc = await EpcPartner.findById(id);
    if (!epc) return res.status(404).json({ message: 'EPC not found' });

    epc.isActive = isActive;
    if (!isActive) {
      epc.deactivationReason = deactivationReason || 'Suspended by Admin';
    } else {
      epc.deactivationReason = ''; // Clear reason on activation
    }

    await epc.save();
    res.status(200).json({ message: `EPC Partner ${isActive ? 'Activated' : 'Deactivated'}`, epc });
  } catch (error) {
    console.error('Error toggling status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add Warning to EPC (Admin)
export const updateTrustBadgeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const epc = await EpcPartner.findById(req.params.id);
    if (!epc) return res.status(404).json({ message: 'EPC not found' });
    
    if (!epc.trustBadge) {
      epc.trustBadge = { status: 'None' };
    }

    if (status === 'Approved') {
      epc.trustBadge.status = 'Approved';
      epc.trustBadge.expiresAt = null;
      epc.trustBadge.remainingLeads = 50;
      epc.trustBadge.remainingViews = 50;
    } else {
      epc.trustBadge.status = status; // Rejected or None
    }
    
    await epc.save();

    const Notification = (await import('../models/Notification.js')).default;
    await Notification.create({
      role: 'EpcPartner',
      recipientId: epc._id,
      title: 'Trust Badge Status Updated',
      message: `Your Trust Badge application has been ${status}.`
    });

    res.json({ message: `Trust Badge status updated to ${status}`, trustBadge: epc.trustBadge });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const addWarning = async (req, res) => {
  try {
    const { id } = req.params;
    const { warning } = req.body;

    if (!warning) return res.status(400).json({ message: 'Warning message is required' });

    const epc = await EpcPartner.findById(id);
    if (!epc) return res.status(404).json({ message: 'EPC not found' });

    epc.warnings.push(warning);
    await epc.save();

    res.status(200).json({ message: 'Warning added', epc });
  } catch (error) {
    console.error('Error adding warning:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
