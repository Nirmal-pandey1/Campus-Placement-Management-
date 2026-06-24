const express = require("express");
const router  = express.Router();
const {
  getOrCreateConversation, getConversations,
  getMessages, sendMessage, getChatUsers,
} = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/conversation",              getOrCreateConversation);
router.get("/conversations",              getConversations);
router.get("/messages/:conversationId",   getMessages);
router.post("/messages",                  sendMessage);
router.get("/users",                      getChatUsers);

module.exports = router;