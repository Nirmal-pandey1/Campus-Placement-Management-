const express    = require("express");
const cors       = require("cors");
const morgan     = require("morgan");
const dotenv     = require("dotenv");
const http       = require("http");
const { Server } = require("socket.io");
const connectDB  = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const rateLimiter  = require("./middleware/rateLimiter");

dotenv.config();
connectDB();

const app    = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin:      process.env.CLIENT_URL,
    methods:     ["GET", "POST"],
    credentials: true,
  },
});

// Store online users
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log(`✅ Socket connected: ${socket.id}`);

  // User joins with their userId
  socket.on("user_join", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("online_users", Array.from(onlineUsers.keys()));
    console.log(`👤 User ${userId} is online`);
  });

  // Join a conversation room
  socket.on("join_conversation", (conversationId) => {
    socket.join(conversationId);
  });

  // Send message via socket
  socket.on("send_message", (data) => {
    socket.to(data.conversationId).emit("receive_message", data);
  });

  // Typing indicator
  socket.on("typing", (data) => {
    socket.to(data.conversationId).emit("user_typing", {
      userId: data.userId,
      name:   data.name,
    });
  });

  socket.on("stop_typing", (data) => {
    socket.to(data.conversationId).emit("user_stop_typing", data);
  });

  // Disconnect
  socket.on("disconnect", () => {
    onlineUsers.forEach((socketId, userId) => {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        io.emit("online_users", Array.from(onlineUsers.keys()));
        console.log(`👤 User ${userId} went offline`);
      }
    });
  });
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/api", rateLimiter);
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth",          require("./routes/authRoutes"));
app.use("/api/students",      require("./routes/studentRoutes"));
app.use("/api/companies",     require("./routes/companyRoutes"));
app.use("/api/jobs",          require("./routes/jobRoutes"));
app.use("/api/applications",  require("./routes/applicationRoutes"));
app.use("/api/admin",         require("./routes/adminRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/interviews",    require("./routes/interviewRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));
app.use("/api/chat",          require("./routes/chatRoutes"));

app.get("/", (req, res) => res.json({ message: "CareerSync API Running 🚀" }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ CareerSync server running on port ${PORT}`));