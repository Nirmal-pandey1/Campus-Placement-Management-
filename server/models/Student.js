const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    user:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rollNumber:  { type: String, required: true, unique: true },
    branch:      { type: String, required: true },
    year:        { type: Number, required: true },
    cgpa:        { type: Number, required: true, min: 0, max: 10 },
    skills:      [{ type: String }],
    resume:      { type: String, default: "" },
    linkedin:    { type: String, default: "" },
    github:      { type: String, default: "" },
    portfolio:   { type: String, default: "" },
    phone:       { type: String, default: "" },
    backlogsCount: { type: Number, default: 0 },
    placementStatus: {
      type: String,
      enum: ["not_placed", "placed", "dream_placed"],
      default: "not_placed",
    },
    placedCompany: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null },
    ctc:           { type: Number, default: 0 },
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);