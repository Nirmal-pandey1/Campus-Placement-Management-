const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    application: { type: mongoose.Schema.Types.ObjectId, ref: "Application", required: true },
    student:     { type: mongoose.Schema.Types.ObjectId, ref: "Student",     required: true },
    job:         { type: mongoose.Schema.Types.ObjectId, ref: "Job",         required: true },
    company:     { type: mongoose.Schema.Types.ObjectId, ref: "Company",     required: true },
    round:       { type: String, required: true },
    date:        { type: Date,   required: true },
    time:        { type: String, required: true },
    mode:        { type: String, enum: ["online", "offline"], required: true },
    link:        { type: String, default: "" },
    venue:       { type: String, default: "" },
    instructions:{ type: String, default: "" },
    status:      { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);