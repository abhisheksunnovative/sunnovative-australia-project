import EpcPartner from '../models/EpcPartner.js';

// Get all EPC partners (Admin)
export const getAllEpcs = async (req, res) => {
  try {
    const { country, district, city, isOverdue } = req.query;
    let query = {};
    
    if (country && country !== 'All') query.country = country;
    if (district && district !== 'All') query.district = district;
    if (city && city !== 'All') query.city = city;
    
    // For Overdue, assuming we filter by overdueCount > 0 or isFrozen
    if (isOverdue === 'true') {
      query.$or = [{ overdueCount: { $gt: 0 } }, { isFrozen: true }];
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
    const { status, validityMonths } = req.body;
    const epc = await EpcPartner.findById(req.params.id);
    if (!epc) return res.status(404).json({ message: 'EPC not found' });
    
    if (!epc.trustBadge) {
      epc.trustBadge = { status: 'None' };
    }

    if (status === 'Approved') {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + (validityMonths || 12));
      epc.trustBadge.status = 'Approved';
      epc.trustBadge.expiresAt = expiresAt;
    } else {
      epc.trustBadge.status = status; // Rejected or None
    }
    
    await epc.save();
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
