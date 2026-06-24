const express = require("express");
const router  = express.Router();
const {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
} = require("../controllers/announcementController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/",    getAnnouncements);
router.post("/",   authorize("admin"), createAnnouncement);
router.delete("/:id", authorize("admin"), deleteAnnouncement);

module.exports = router;