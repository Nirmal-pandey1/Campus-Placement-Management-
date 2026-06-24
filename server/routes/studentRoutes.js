const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const User = require("../models/User");
const Job = require("../models/Job");
const { protect, authorize } = require("../middleware/authMiddleware");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Local storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/resumes";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `resume_${req.user._id}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = [".pdf", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, DOCX files allowed"));
    }
  },
});

// Image storage for profile photos
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/avatars";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `avatar_${req.user._id}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const uploadAvatar = multer({
  storage: imageStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: (req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, WEBP files allowed"));
    }
  },
});

// Get student profile
router.get("/profile", protect, authorize("student"), async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id })
      .populate("user", "name email avatar");
    if (!student) return errorResponse(res, 404, "Profile not found");
    successResponse(res, 200, "Profile fetched", { student });
  } catch (err) { next(err); }
});

// Update student profile
router.put("/profile", protect, authorize("student"), async (req, res, next) => {
  try {
    const { name, user, _id, __v, ...studentData } = req.body;

    // Update name in User model if provided
    if (name) {
      await User.findByIdAndUpdate(req.user._id, { name });
    }

    // Remove any fields that shouldn't be in Student model
    delete studentData.user;
    delete studentData._id;
    delete studentData.__v;
    delete studentData.placedCompany;

    // Update rest in Student model
    const student = await Student.findOneAndUpdate(
      { user: req.user._id },
      { $set: studentData },
      { new: true, runValidators: false }
    ).populate("user", "name email avatar");

    successResponse(res, 200, "Profile updated", { student });
  } catch (err) { next(err); }
});

// Upload resume (local storage)
router.post("/resume", protect, authorize("student"), upload.single("resume"), async (req, res, next) => {
  try {
    if (!req.file) return errorResponse(res, 400, "No file uploaded");

    // Build URL to access the file
    const resumeUrl = `${req.protocol}://${req.get("host")}/uploads/resumes/${req.file.filename}`;

    const student = await Student.findOneAndUpdate(
      { user: req.user._id },
      { resume: resumeUrl },
      { new: true }
    );
    successResponse(res, 200, "Resume uploaded successfully!", { resume: student.resume });
  } catch (err) { next(err); }
});

// Save a job
router.post("/saved-jobs/:jobId", protect, authorize("student"), async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return errorResponse(res, 404, "Student not found");

    const jobId = req.params.jobId;

    // Check if already saved
    if (student.savedJobs.includes(jobId)) {
      return errorResponse(res, 400, "Job already saved");
    }

    student.savedJobs.push(jobId);
    await student.save();

    successResponse(res, 200, "Job saved successfully!", { savedJobs: student.savedJobs });
  } catch (err) { next(err); }
});

// Unsave a job
router.delete("/saved-jobs/:jobId", protect, authorize("student"), async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return errorResponse(res, 404, "Student not found");

    student.savedJobs = student.savedJobs.filter(
      id => id.toString() !== req.params.jobId
    );
    await student.save();

    successResponse(res, 200, "Job removed from saved!", { savedJobs: student.savedJobs });
  } catch (err) { next(err); }
});

// Get all saved jobs
router.get("/saved-jobs", protect, authorize("student"), async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id })
      .populate({
        path: "savedJobs",
        populate: { path: "company", select: "companyName logo location industry" },
      });

    if (!student) return errorResponse(res, 404, "Student not found");

    successResponse(res, 200, "Saved jobs fetched", { savedJobs: student.savedJobs });
  } catch (err) { next(err); }
});

// Upload avatar
router.post("/avatar", protect, authorize("student"), uploadAvatar.single("avatar"), async (req, res, next) => {
  try {
    if (!req.file) return errorResponse(res, 400, "No file uploaded");

    const avatarUrl = `${req.protocol}://${req.get("host")}/uploads/avatars/${req.file.filename}`;

    // Update User model avatar
    await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl });

    successResponse(res, 200, "Profile photo updated!", { avatar: avatarUrl });
  } catch (err) { next(err); }
});

module.exports = router;