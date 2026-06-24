const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title:    { type: String, required: true },
    message:  { type: String, required: true },
    priority: { type: String, enum: ["high", "medium", "low"], default: "medium" },
    target:   { type: String, enum: ["all", "students", "companies"], default: "all" },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", announcementSchema);