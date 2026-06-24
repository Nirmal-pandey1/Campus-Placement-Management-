const Notification = require("../models/Notification");

const createNotification = async ({ recipient, title, message, type, link }) => {
  try {
    await Notification.create({ recipient, title, message, type, link });
  } catch (err) {
    console.error("Notification error:", err.message);
  }
};

module.exports = createNotification;