import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: { 
      type: String, 
      required: true 
      // can be 'admin', or a specific BDE/Customer/EPC ID
    },
    role: { 
      type: String, 
      enum: ['admin', 'bde', 'customer', 'epc'], 
      required: true 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, default: 'info' }, // 'info', 'success', 'warning', 'error', 'document', 'lead'
    read: { type: Boolean, default: false },
    relatedId: { type: mongoose.Schema.Types.ObjectId, refPath: 'onModel' },
    onModel: { type: String, enum: ['BDE', 'Customer', 'EPC', 'Lead', 'ProjectOrder'] },
    link: { type: String } // Frontend route to navigate to on click
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
