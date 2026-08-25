export const scheduleAndQualifyLead = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { scheduledDate, notes } = req.body;
    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    // Mark as booked, but do NOT set status to Converted yet so it remains in Prospect
    lead.status = 'Interested'; // Keep it active
    lead.installDateBooked = true; // This makes it a prospect
    if (scheduledDate) {
      lead.preferredInstallDate = new Date(scheduledDate);
      lead.finalInstallDate = new Date(scheduledDate);
      lead.isInstallDateFixed = true;
    }
    if (notes) lead.notes = notes;
    lead.history.push({ 
      action: `Installation Date Finalized by BDE`, 
      date: new Date() 
    });
    await lead.save();

    // Trigger Notification for Customer and EPC
    try {
      const { default: Notification } = await import('../models/Notification.js');
      // To EPCs / Admin (Broadcasted)
      await Notification.create({
        role: 'EPC', // Assuming EPCs can see these
        title: 'New Installation Date Fixed',
        message: `Lead ${lead.name} has finalized installation date for ${new Date(scheduledDate).toLocaleDateString()}.`,
        leadId: lead._id
      });
      // To Customer
      await Notification.create({
        role: 'Customer',
        title: 'Installation Date Confirmed',
        message: `Your installation has been scheduled for ${new Date(scheduledDate).toLocaleDateString()}.`,
        leadId: lead._id,
        userId: lead._id // If Customer notifications use leadId or userId
      });
    } catch (notifErr) {
      console.error("Failed to create notifications:", notifErr);
    }

    res.json({ success: true, lead, message: 'Installation date locked successfully! The lead is now moved to your Prospects.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
