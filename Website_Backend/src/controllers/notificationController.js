import Notification from '../models/Notification.js';

// @desc    Get Admin Notifications
// @route   GET /api/notifications/admin
// @access  Admin
export const getAdminNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ role: 'Admin' })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get EPC Notifications
// @route   GET /api/notifications/epc
// @access  EPC
export const getEpcNotifications = async (req, res) => {
  try {
    const epcId = req.epc._id;
    const notifications = await Notification.find({ role: 'EpcPartner', recipientId: epcId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark Notification as Read
// @route   PUT /api/notifications/:id/read
// @access  Admin/EPC
export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Customer Notifications
// @route   GET /api/notifications/customer
// @access  Customer
export const getCustomerNotifications = async (req, res) => {
  try {
    const custId = req.customer?._id?.toString();
    const custMobile = req.customer?.mobile;
    const notifications = await Notification.find({
      role: 'Customer',
      $or: [
        { recipientId: custId },
        { recipientId: custMobile }
      ]
    }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Utility function to create a notification (not a route)
export const createNotification = async (role, title, message, recipientId = null) => {
  try {
    await Notification.create({ role, title, message, recipientId });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};
