const express = require("express");
const router  = express.Router();
const {
  scheduleInterview, getMyInterviews,
  getCompanyInterviews, updateInterview, cancelInterview,
} = require("../controllers/interviewController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/",           protect, authorize("company"), scheduleInterview);
router.get("/my",          protect, authorize("student"), getMyInterviews);
router.get("/company",     protect, authorize("company"), getCompanyInterviews);
router.put("/:id",         protect, authorize("company"), updateInterview);
router.delete("/:id",      protect, authorize("company"), cancelInterview);

module.exports = router;