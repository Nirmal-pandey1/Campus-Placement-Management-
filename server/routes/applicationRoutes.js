const express = require("express");
const router  = express.Router();
const {
  applyForJob, getMyApplications, getJobApplicants,
  updateApplicationStatus, withdrawApplication,
} = require("../controllers/applicationController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/:jobId",       protect, authorize("student"), applyForJob);
router.get("/my",            protect, authorize("student"), getMyApplications);
router.put("/:id/withdraw",  protect, authorize("student"), withdrawApplication);
router.get("/job/:jobId",    protect, authorize("company"), getJobApplicants);
router.put("/:id/status",    protect, authorize("company"), updateApplicationStatus);

module.exports = router;