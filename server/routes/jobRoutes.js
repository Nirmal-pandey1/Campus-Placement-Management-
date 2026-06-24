const express = require("express");
const router  = express.Router();
const {
  getAllJobs, getJobById, createJob,
  updateJob, deleteJob, getMyJobs
} = require("../controllers/jobController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/",                protect, getAllJobs);
router.get("/company/my-jobs", protect, authorize("company"), getMyJobs);
router.get("/:id",             protect, getJobById);
router.post("/",               protect, authorize("company"), createJob);
router.put("/:id",             protect, authorize("company"), updateJob);
router.delete("/:id",          protect, authorize("company"), deleteJob);

module.exports = router;