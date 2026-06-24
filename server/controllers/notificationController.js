const Notification = require("../models/Notification");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// Get all notifications for logged in user
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort("-createdAt")
      .limit(20);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    successResponse(res, 200, "Notifications fetched", { notifications, unreadCount });
  } catch (err) {
    next(err);
  }
};

// Mark single notification as read
exports.markAsRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true }
    );
    successResponse(res, 200, "Marked as read");
  } catch (err) {
    next(err);
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );
    successResponse(res, 200, "All marked as read");
  } catch (err) {
    next(err);
  }
};

// Delete a notification
exports.deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id,
    });
    successResponse(res, 200, "Notification deleted");
  } catch (err) {
    next(err);
  }
};