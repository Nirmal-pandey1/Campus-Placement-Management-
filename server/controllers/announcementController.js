const Announcement       = require("../models/Announcement");
const User               = require("../models/User");
const sendEmail          = require("../utils/sendEmail");
const createNotification = require("../utils/createNotification");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// @desc  Create announcement (Admin)
// @route POST /api/announcements
// @access Private (Admin)
exports.createAnnouncement = async (req, res, next) => {
  try {
    const { title, message, priority, target } = req.body;

    const announcement = await Announcement.create({
      title, message, priority, target,
      postedBy: req.user._id,
    });

    // Find target users
    let query = {};
    if (target === "students")  query.role = "student";
    if (target === "companies") query.role = "company";

    const users = await User.find(query).select("name email role _id");

    // Send in-app notification + email to all target users
    const priorityEmoji = {
      high:   "🔴",
      medium: "🟡",
      low:    "🟢",
    };

    await Promise.all(
      users.map(async (user) => {
        // In-app notification
        await createNotification({
          recipient: user._id,
          title:     `${priorityEmoji[priority]} ${title}`,
          message,
          type:      "system",
          link:      "/announcements",
        });

        // Email
        await sendEmail({
          to:      user.email,
          subject: `CareerSync Announcement — ${title}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f4f8; margin: 0; }
                .wrapper { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
                .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 32px; text-align: center; }
                .header h1 { color: white; font-size: 24px; font-weight: 700; margin: 0; }
                .header p  { color: #bfdbfe; font-size: 13px; margin-top: 4px; }
                .body { padding: 32px; }
                .body h2 { font-size: 20px; color: #1e293b; margin-bottom: 12px; }
                .body p  { font-size: 15px; color: #475569; line-height: 1.7; }
                .priority-high   { background: #fee2e2; color: #dc2626; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; display: inline-block; margin-bottom: 16px; }
                .priority-medium { background: #fef9c3; color: #ca8a04; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; display: inline-block; margin-bottom: 16px; }
                .priority-low    { background: #dcfce7; color: #16a34a; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; display: inline-block; margin-bottom: 16px; }
                .message-box { background: #f8fafc; border-left: 4px solid #2563eb; border-radius: 8px; padding: 16px; margin: 16px 0; font-size: 15px; color: #334155; line-height: 1.7; }
                .btn { display: inline-block; background: #2563eb; color: white !important; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin: 16px 0; }
                .footer { background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; }
                .footer p { font-size: 12px; color: #94a3b8; }
              </style>
            </head>
            <body>
              <div class="wrapper">
                <div class="header">
                  <h1>🎓 CareerSync</h1>
                  <p>A Digital Platform For Campus Recruitment</p>
                </div>
                <div class="body">
                  <h2>📢 New Announcement</h2>
                  <span class="priority-${priority}">
                    ${priorityEmoji[priority]} ${priority.toUpperCase()} PRIORITY
                  </span>
                  <h3 style="color:#1e293b; margin-bottom:8px;">${title}</h3>
                  <div class="message-box">${message}</div>
                  <p style="font-size:13px; color:#94a3b8;">
                    Posted on ${new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </p>
                  <a href="${process.env.CLIENT_URL}/announcements" class="btn">
                    View Announcement
                  </a>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} CareerSync — A Digital Platform For Campus Recruitment</p>
                </div>
              </div>
            </body>
            </html>
          `,
        });
      })
    );

    successResponse(res, 201, `Announcement sent to ${users.length} users!`, { announcement });
  } catch (err) {
    next(err);
  }
};

// @desc  Get all announcements
// @route GET /api/announcements
// @access Private
exports.getAnnouncements = async (req, res, next) => {
  try {
    const query = {};

    // Filter by target role
    if (req.user.role !== "admin") {
      query.$or = [
        { target: "all" },
        { target: req.user.role === "student" ? "students" : "companies" },
      ];
    }

    const announcements = await Announcement.find(query)
      .populate("postedBy", "name")
      .sort("-createdAt");

    successResponse(res, 200, "Announcements fetched", { announcements });
  } catch (err) {
    next(err);
  }
};

// @desc  Delete announcement (Admin)
// @route DELETE /api/announcements/:id
// @access Private (Admin)
exports.deleteAnnouncement = async (req, res, next) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    successResponse(res, 200, "Announcement deleted");
  } catch (err) {
    next(err);
  }
};