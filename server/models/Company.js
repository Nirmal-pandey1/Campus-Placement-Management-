const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    user:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    companyName: { type: String, required: true },
    logo:        { type: String, default: "" },
    website:     { type: String, default: "" },
    industry:    { type: String, required: true },
    description: { type: String, default: "" },
    location:    { type: String, required: true },
    hrName:      { type: String, required: true },
    hrEmail:     { type: String, required: true },
    hrPhone:     { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", companySchema);