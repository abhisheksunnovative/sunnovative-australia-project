import mongoose from 'mongoose';

const epcCalendarSchema = new mongoose.Schema({
  epcPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'EpcPartner', required: true },
  projectType: {
    type: String,
    enum: ['Surya Ghar Yojana', 'Group Solar', 'Village Solar Campaign', 'Commercial Solar', 'Residential Solar'],
    required: true,
  },
  district:        { type: String, required: true },
  date:            { type: Date, required: true },
  maxBookings:     { type: Number, default: 1 },
  currentBookings: { type: Number, default: 0 },
  isAvailable:     { type: Boolean, default: true },
  isBlocked:       { type: Boolean, default: false },
}, { timestamps: true });

epcCalendarSchema.index(
  { epcPartner: 1, projectType: 1, district: 1, date: 1 },
  { unique: true }
);

export default mongoose.model('EpcCalendar', epcCalendarSchema);