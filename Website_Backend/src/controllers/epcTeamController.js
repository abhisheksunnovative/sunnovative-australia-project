import EpcTeamMember from '../models/EpcTeammember.js';
import EpcPartner from '../models/EpcPartner.js';
import EpcPlan from '../models/EpcPlan.js';

export const getTeamMembers = async (req, res) => {
  try {
    const members = await EpcTeamMember.find({ epcPartner: req.epc._id })
      .select('-password').sort({ createdAt: -1 });
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const addTeamMember = async (req, res) => {
  try {
    const { name, email, mobile, password, role, assignedDistricts, assignedProjectTypes } = req.body;
    if (!name || !email || !mobile || !password)
      return res.status(400).json({ message: 'Name, email, mobile and password required' });

    const epc = await EpcPartner.findById(req.epc._id).populate('plan');
    const validDistricts = (assignedDistricts || []).filter(d => (epc.activeDistricts || []).includes(d));

    if (await EpcTeamMember.findOne({ email, epcPartner: req.epc._id }))
      return res.status(400).json({ message: 'Team member with this email already exists' });

    // Capacity Check for Installers
    if ((role || 'Installer') === 'Installer') {
      const defaultLimit = epc.plan?.installerLimit || 1;
      
      for (const district of validDistricts) {
        const customCap = epc.districtCapacities?.find(d => d.district === district);
        const allowedCount = customCap ? customCap.installerCount : defaultLimit;

        const currentCount = await EpcTeamMember.countDocuments({
          epcPartner: req.epc._id,
          role: 'Installer',
          assignedDistricts: district,
          isActive: true
        });

        if (currentCount >= allowedCount) {
          return res.status(400).json({ 
            message: `Capacity limit reached for ${district}. You have ${currentCount}/${allowedCount} installers. Please upgrade your capacity for this district.`,
            code: 'CAPACITY_LIMIT_REACHED'
          });
        }
      }
    }

    const member = await EpcTeamMember.create({
      epcPartner: req.epc._id,
      name, email, mobile, password,
      role: role || 'Installer',
      assignedDistricts:    validDistricts,
      assignedProjectTypes: assignedProjectTypes || [],
    });

    const memberObj = member.toObject();
    delete memberObj.password;
    res.status(201).json({ message: 'Team member added', member: memberObj });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const updateTeamMember = async (req, res) => {
  try {
    const member = await EpcTeamMember.findOne({ _id: req.params.id, epcPartner: req.epc._id });
    if (!member) return res.status(404).json({ message: 'Team member not found' });

    const epc = await EpcPartner.findById(req.epc._id);
    const { role, assignedDistricts, assignedProjectTypes, isActive } = req.body;

    if (role !== undefined)     member.role     = role;
    if (isActive !== undefined) member.isActive = isActive;
    if (assignedDistricts)
      member.assignedDistricts = assignedDistricts.filter(d => (epc.activeDistricts || []).includes(d));
    if (assignedProjectTypes)
      member.assignedProjectTypes = assignedProjectTypes;

    await member.save();
    const memberObj = member.toObject();
    delete memberObj.password;
    res.json({ message: 'Updated', member: memberObj });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const removeTeamMember = async (req, res) => {
  try {
    const member = await EpcTeamMember.findOneAndDelete({ _id: req.params.id, epcPartner: req.epc._id });
    if (!member) return res.status(404).json({ message: 'Team member not found' });
    res.json({ message: 'Team member removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};