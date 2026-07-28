import EpcCalendar from '../models/EpcCalender.js';

export const getCalendarSlots = async (req, res) => {
  try {
    const { projectType, district, month, year } = req.query;
    const filter = { epcPartner: req.epc._id };
    if (projectType) filter.projectType = projectType;
    if (district)    filter.district    = district;
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end   = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    }
    const slots = await EpcCalendar.find(filter).sort({ date: 1 });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const addCalendarSlot = async (req, res) => {
  try {
    const { projectType, district, date, maxBookings } = req.body;
    if (!projectType || !district || !date)
      return res.status(400).json({ message: 'projectType, district and date required' });

    if (!req.epc.activeDistricts.includes(district))
      return res.status(403).json({ message: 'District not in your active plan' });

    const slot = await EpcCalendar.create({
      epcPartner: req.epc._id,
      projectType, district,
      date: new Date(date),
      maxBookings: maxBookings || 1,
      isAvailable: true,
    });
    res.status(201).json({ message: 'Slot added', slot });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ message: 'Slot already exists for this date' });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const addBulkSlots = async (req, res) => {
  try {
    const { projectType, district, dates, maxBookings } = req.body;
    if (!dates?.length) return res.status(400).json({ message: 'dates array required' });
    if (!req.epc.activeDistricts.includes(district))
      return res.status(403).json({ message: 'District not in your active plan' });

    const slots = dates.map(d => ({
      epcPartner: req.epc._id,
      projectType, district,
      date: new Date(d),
      maxBookings: maxBookings || 1,
      isAvailable: true,
    }));
    await EpcCalendar.insertMany(slots, { ordered: false }).catch(() => {});
    res.status(201).json({ message: `${slots.length} slots processed` });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const updateCalendarSlot = async (req, res) => {
  try {
    const slot = await EpcCalendar.findOne({ _id: req.params.id, epcPartner: req.epc._id });
    if (!slot) return res.status(404).json({ message: 'Slot not found' });

    const { isBlocked, maxBookings } = req.body;
    if (isBlocked !== undefined) { slot.isBlocked = isBlocked; slot.isAvailable = !isBlocked; }
    if (maxBookings) slot.maxBookings = maxBookings;

    await slot.save();
    res.json({ message: 'Slot updated', slot });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const deleteCalendarSlot = async (req, res) => {
  try {
    const slot = await EpcCalendar.findOneAndDelete({ _id: req.params.id, epcPartner: req.epc._id });
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    res.json({ message: 'Slot deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const getAvailableSlots = async (req, res) => {
  try {
    const { epcId, projectType, district } = req.query;
    if (!epcId || !projectType || !district)
      return res.status(400).json({ message: 'epcId, projectType, district required' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const slots = await EpcCalendar.find({
      epcPartner:  epcId,
      projectType, district,
      date:        { $gte: today },
      isAvailable: true,
      isBlocked:   false,
      $expr:       { $lt: ['$currentBookings', '$maxBookings'] },
    }).sort({ date: 1 });

    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};