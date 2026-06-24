const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job:      { type: mongoose.Schema.Types.ObjectId, ref: "Job",     required: true },
    student:  { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    status: {
      type: String,
      enum: ["applied", "shortlisted", "interview", "selected", "rejected", "withdrawn"],
      default: "applied",
    },
    resume:        { type: String, required: true },
    coverLetter:   { type: String, default: "" },
    currentRound:  { type: String, default: "Applied" },
    interviewDate: { type: Date },
    feedback:      { type: String, default: "" },
    offeredCTC:    { type: Number, default: 0 },
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);