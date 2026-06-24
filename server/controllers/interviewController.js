const Interview          = require("../models/Interview");
const Application        = require("../models/Application");
const Student            = require("../models/Student");
const Job                = require("../models/Job");
const Company            = require("../models/Company");
const User               = require("../models/User");
const sendEmail          = require("../utils/sendEmail");
const createNotification = require("../utils/createNotification");
const { successResponse, errorResponse } = require("../utils/apiResponse");

// @desc  Schedule an interview (Company)
// @route POST /api/interviews
// @access Private (Company)
exports.scheduleInterview = async (req, res, next) => {
  try {
    const { applicationId, round, date, time, mode, link, venue, instructions } = req.body;

    const company = await Company.findOne({ user: req.user._id });
    if (!company) return errorResponse(res, 404, "Company not found");

    const application = await Application.findById(applicationId)
      .populate("student")
      .populate("job");

    if (!application) return errorResponse(res, 404, "Application not found");

    // Create interview
    const interview = await Interview.create({
      application: applicationId,
      student:     application.student._id,
      job:         application.job._id,
      company:     company._id,
      round, date, time, mode, link, venue, instructions,
    });

    // Update application status to interview
    await Application.findByIdAndUpdate(applicationId, {
      status:        "interview",
      currentRound:  round,
      interviewDate: date,
    });

    // Get student user details
    const studentUser = await User.findById(application.student.user);

    // Send in-app notification
    await createNotification({
      recipient: application.student.user,
      title:     "Interview Scheduled! 🗓",
      message:   `Your interview for ${application.job.title} has been scheduled on ${new Date(date).toLocaleDateString()} at ${time}.`,
      type:      "interview",
      link:      "/interviews",
    });

    // Send email notification
    await sendEmail({
      to:      studentUser.email,
      subject: `Interview Scheduled — ${application.job.title} at ${company.companyName}`,
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
            .body p  { font-size: 15px; color: #475569; line-height: 1.7; margin-bottom: 12px; }
            .info-box { background: #f8fafc; border-left: 4px solid #2563eb; border-radius: 8px; padding: 16px; margin: 20px 0; }
            .info-box p { margin: 6px 0; font-size: 14px; color: #334155; }
            .info-box strong { color: #1e293b; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; background: #dbeafe; color: #2563eb; }
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
              <h2>🗓 Interview Scheduled!</h2>
              <p>Hi <strong>${studentUser.name}</strong>,</p>
              <p>Your interview has been scheduled. Please find the details below:</p>
              <div class="info-box">
                <p><strong>Company:</strong> ${company.companyName}</p>
                <p><strong>Job Title:</strong> ${application.job.title}</p>
                <p><strong>Round:</strong> <span class="badge">${round}</span></p>
                <p><strong>Date:</strong> ${new Date(date).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                <p><strong>Time:</strong> ${time}</p>
                <p><strong>Mode:</strong> ${mode === "online" ? "💻 Online" : "🏢 Offline"}</p>
                ${link  ? `<p><strong>Meeting Link:</strong> <a href="${link}">${link}</a></p>` : ""}
                ${venue ? `<p><strong>Venue:</strong> ${venue}</p>` : ""}
                ${instructions ? `<p><strong>Instructions:</strong> ${instructions}</p>` : ""}
              </div>
              <p>Please be well prepared and join on time. Best of luck! 💪</p>
              <a href="${process.env.CLIENT_URL}/interviews" class="btn">View Interview Details</a>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} CareerSync — A Digital Platform For Campus Recruitment</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    successResponse(res, 201, "Interview scheduled successfully!", { interview });
  } catch (err) {
    next(err);
  }
};

// @desc  Get all interviews for student
// @route GET /api/interviews/my
// @access Private (Student)
exports.getMyInterviews = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return errorResponse(res, 404, "Student not found");

    const interviews = await Interview.find({ student: student._id })
      .populate("job",     "title salary type")
      .populate("company", "companyName logo location")
      .sort("date");

    successResponse(res, 200, "Interviews fetched", { interviews });
  } catch (err) {
    next(err);
  }
};

// @desc  Get all interviews scheduled by company
// @route GET /api/interviews/company
// @access Private (Company)
exports.getCompanyInterviews = async (req, res, next) => {
  try {
    const company = await Company.findOne({ user: req.user._id });
    if (!company) return errorResponse(res, 404, "Company not found");

    const interviews = await Interview.find({ company: company._id })
      .populate({ path: "student", populate: { path: "user", select: "name email" } })
      .populate("job", "title")
      .sort("date");

    successResponse(res, 200, "Interviews fetched", { interviews });
  } catch (err) {
    next(err);
  }
};

// @desc  Update interview status
// @route PUT /api/interviews/:id
// @access Private (Company)
exports.updateInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!interview) return errorResponse(res, 404, "Interview not found");
    successResponse(res, 200, "Interview updated", { interview });
  } catch (err) {
    next(err);
  }
};

// @desc  Cancel interview
// @route DELETE /api/interviews/:id
// @access Private (Company)
exports.cancelInterview = async (req, res, next) => {
  try {
    const company   = await Company.findOne({ user: req.user._id });
    const interview = await Interview.findOneAndUpdate(
      { _id: req.params.id, company: company._id },
      { status: "cancelled" },
      { new: true }
    ).populate({ path: "student", populate: { path: "user", select: "name email" } })
     .populate("job", "title");

    if (!interview) return errorResponse(res, 404, "Interview not found");

    // Notify student
    await createNotification({
      recipient: interview.student.user._id,
      title:     "Interview Cancelled",
      message:   `Your interview for ${interview.job.title} scheduled on ${new Date(interview.date).toLocaleDateString()} has been cancelled.`,
      type:      "interview",
      link:      "/interviews",
    });

    successResponse(res, 200, "Interview cancelled");
  } catch (err) {
    next(err);
  }
};