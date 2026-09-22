import KycRequirement from '../models/KycRequirement.js';
import EpcPartner from '../models/EpcPartner.js';

// ---- ADMIN ROUTES ----

export const getKycRequirements = async (req, res) => {
  try {
    const { country, state } = req.query;
    let query = {};
    if (country) query.country = country.toLowerCase();
    if (state) query.state = state;
    
    const reqs = await KycRequirement.find(query).sort({ createdAt: -1 });
    res.json(reqs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createKycRequirement = async (req, res) => {
  try {
    const newReq = new KycRequirement(req.body);
    await newReq.save();
    res.status(201).json(newReq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteKycRequirement = async (req, res) => {
  try {
    await KycRequirement.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEpcKycList = async (req, res) => {
  try {
    const { country, state } = req.query;
    let query = {};
    if (country) query.country = country.toLowerCase();
    if (state && state !== 'All') query.state = state;

    const epcs = await EpcPartner.find(query).select('companyName ownerName email mobile kycDocuments onboardingStatus country state city').sort({ createdAt: -1 });
    res.json(epcs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEpcKycStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const epc = await EpcPartner.findByIdAndUpdate(req.params.id, { onboardingStatus: status }, { new: true });
    res.json(epc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---- EPC ROUTES ----

export const uploadEpcKycDocument = async (req, res) => {
  try {
    // Assuming multer handles the file upload and puts it in req.file
    const { documentName } = req.body;
    const epcId = req.user._id; // from protectEpc middleware
    
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = /uploads/kyc/;
    
    const epc = await EpcPartner.findById(epcId);
    if (!epc) return res.status(404).json({ message: "EPC not found" });

    // Check if doc exists, then replace, otherwise push
    const existingIndex = epc.kycDocuments.dynamicDocuments.findIndex(d => d.documentName === documentName);
    if (existingIndex > -1) {
      epc.kycDocuments.dynamicDocuments[existingIndex].fileUrl = fileUrl;
      epc.kycDocuments.dynamicDocuments[existingIndex].status = 'Pending';
      epc.kycDocuments.dynamicDocuments[existingIndex].uploadedAt = new Date();
    } else {
      epc.kycDocuments.dynamicDocuments.push({
        documentName,
        fileUrl,
        status: 'Pending'
      });
    }

    if (epc.onboardingStatus === 'Pending' || epc.onboardingStatus === 'Rejected') {
      epc.onboardingStatus = 'KYC Submitted';
    }

    await epc.save();
    res.json(epc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
