const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    company:     { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },
    title:       { type: String, required: true },
    description: { type: String, required: true },
    type:        { type: String, enum: ["full_time", "internship", "ppo"], required: true },
    location:    { type: String, required: true },
    salary:      { type: Number, required: true },
    stipend:     { type: Number, default: 0 },
    eligibility: {
      branches:      [{ type: String }],
      minCGPA:       { type: Number, default: 0 },
      maxBacklogs:   { type: Number, default: 0 },
      yearOfPassing: { type: Number },
    },
    skills:      [{ type: String }],
    applicationDeadline: { type: Date, required: true },
    driveDate:           { type: Date },
    rounds:      [{ type: String }],
    status:      { type: String, enum: ["open", "closed", "cancelled"], default: "open" },
    isApproved:  { type: Boolean, default: false },
    applicationsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);