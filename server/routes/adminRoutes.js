const express = require("express");
const router  = express.Router();
const {
  getDashboardStats, approveCompany, approveJob,
  getAllStudents, getAllCompanies, getPlacementReport, getAllJobs, deleteUser,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect, authorize("admin"));

router.get("/stats",                 getDashboardStats);
router.get("/all-jobs",              getAllJobs);
router.get("/students",              getAllStudents);
router.get("/companies",             getAllCompanies);
router.get("/reports",               getPlacementReport);
router.put("/companies/:id/approve", approveCompany);
router.put("/jobs/:id/approve",      approveJob);
router.delete("/users/:id", deleteUser);

module.exports = router;