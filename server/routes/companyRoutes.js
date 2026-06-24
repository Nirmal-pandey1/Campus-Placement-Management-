const multer = require("multer");
const path   = require("path");
const fs     = require("fs");
const User   = require("../models/User");
const express = require("express");
const router  = express.Router();
const Company = require("../models/Company");
const { protect, authorize } = require("../middleware/authMiddleware");
const { uploadImage } = require("../config/cloudinary");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// Get company profile
router.get("/profile", protect, authorize("company"), async (req, res, next) => {
  try {
    const company = await Company.findOne({ user: req.user._id })
      .populate("user", "name email isApproved");
    if (!company) return errorResponse(res, 404, "Profile not found");
    successResponse(res, 200, "Profile fetched", { company });
  } catch (err) { next(err); }
});

// Update company profile
router.put("/profile", protect, authorize("company"), async (req, res, next) => {
  try {
    const company = await Company.findOneAndUpdate(
      { user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    successResponse(res, 200, "Profile updated", { company });
  } catch (err) { next(err); }
});

// Upload company logo
router.post("/logo", protect, authorize("company"), uploadImage.single("logo"), async (req, res, next) => {
  try {
    if (!req.file) return errorResponse(res, 400, "No file uploaded");
    const company = await Company.findOneAndUpdate(
      { user: req.user._id },
      { logo: req.file.path },
      { new: true }
    );
    successResponse(res, 200, "Logo uploaded", { logo: company.logo });
  } catch (err) { next(err); }
});

// Avatar storage
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/avatars";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `avatar_${req.user._id}_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp"];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, WEBP allowed"));
    }
  },
});

// Upload company avatar
router.post("/avatar", protect, authorize("company"), uploadAvatar.single("avatar"), async (req, res, next) => {
  try {
    if (!req.file) return errorResponse(res, 400, "No file uploaded");
    const avatarUrl = `${req.protocol}://${req.get("host")}/uploads/avatars/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl });
    successResponse(res, 200, "Profile photo updated!", { avatar: avatarUrl });
  } catch (err) { next(err); }
});

module.exports = router;