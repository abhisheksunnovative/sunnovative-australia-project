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

// @desc    Get BDE Notifications
// @route   GET /api/notifications/bde/:bdeId
export const getBdeNotifications = async (req, res) => {
  try {
    const bdeId = req.params.bdeId;
    const notifications = await Notification.find({ role: 'BDE', recipientId: bdeId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Single Notification
// @route   DELETE /api/notifications/:id
export const deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Multiple Notifications (Batch)
// @route   POST /api/notifications/delete-batch
export const deleteMultipleNotifications = async (req, res) => {
  try {
    const { ids } = req.body;
    await Notification.deleteMany({ _id: { $in: ids } });
    res.json({ success: true, message: "Selected notifications deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark Multiple Notifications as Read (Batch)
// @route   POST /api/notifications/mark-all-read
export const markMultipleRead = async (req, res) => {
  try {
    const { ids } = req.body;
    await Notification.updateMany(
      { _id: { $in: ids } },
      { isRead: true }
    );
    res.json({ success: true, message: "Selected notifications marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
