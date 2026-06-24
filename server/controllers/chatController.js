const Conversation = require("../models/Conversation");
const Message      = require("../models/Message");
const User         = require("../models/User");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// @desc  Get or create conversation between 2 users
// @route POST /api/chat/conversation
// @access Private
exports.getOrCreateConversation = async (req, res, next) => {
  try {
    const { receiverId } = req.body;
    const senderId       = req.user._id.toString();

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate("participants", "name email role avatar");

    // Create new if not exists
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
      conversation = await Conversation.findById(conversation._id)
        .populate("participants", "name email role avatar");
    }

    successResponse(res, 200, "Conversation fetched", { conversation });
  } catch (err) {
    next(err);
  }
};

// @desc  Get all conversations for logged in user
// @route GET /api/chat/conversations
// @access Private
exports.getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate("participants", "name email role avatar")
      .sort("-lastMessageAt");

    successResponse(res, 200, "Conversations fetched", { conversations });
  } catch (err) {
    next(err);
  }
};

// @desc  Get messages for a conversation
// @route GET /api/chat/messages/:conversationId
// @access Private
exports.getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({
      conversation: req.params.conversationId,
    })
      .populate("sender", "name role avatar")
      .sort("createdAt");

    // Mark messages as read
    await Message.updateMany(
      { conversation: req.params.conversationId, sender: { $ne: req.user._id }, isRead: false },
      { isRead: true }
    );

    // Reset unread count for this user
    await Conversation.findByIdAndUpdate(req.params.conversationId, {
      [`unreadCount.${req.user._id}`]: 0,
    });

    successResponse(res, 200, "Messages fetched", { messages });
  } catch (err) {
    next(err);
  }
};

// @desc  Send a message
// @route POST /api/chat/messages
// @access Private
exports.sendMessage = async (req, res, next) => {
  try {
    const { conversationId, content } = req.body;

    const message = await Message.create({
      conversation: conversationId,
      sender:       req.user._id,
      content,
    });

    // Update conversation last message
    const conversation = await Conversation.findById(conversationId);
    const otherUser    = conversation.participants.find(
      p => p.toString() !== req.user._id.toString()
    );

    // Increment unread count for other user
    const currentUnread = conversation.unreadCount?.get(otherUser.toString()) || 0;
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage:   content,
      lastMessageAt: new Date(),
      [`unreadCount.${otherUser}`]: currentUnread + 1,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name role avatar");

    successResponse(res, 201, "Message sent", { message: populatedMessage });
  } catch (err) {
    next(err);
  }
};

// @desc  Get all users to start chat with
// @route GET /api/chat/users
// @access Private
exports.getChatUsers = async (req, res, next) => {
  try {
    let users = [];

    if (req.user.role === "student") {
      // Students can chat with companies
      users = await User.find({ role: "company", isApproved: true })
        .select("name email role");
    } else if (req.user.role === "company") {
      // Companies can chat with students
      users = await User.find({ role: "student" })
        .select("name email role");
    } else {
      // Admin can chat with everyone
      users = await User.find({ _id: { $ne: req.user._id } })
        .select("name email role");
    }

    successResponse(res, 200, "Users fetched", { users });
  } catch (err) {
    next(err);
  }
};