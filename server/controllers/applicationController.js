const Application = require("../models/Application");
const Job = require("../models/Job");
const Student = require("../models/Student");
const Company = require("../models/Company");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const templates = require("../utils/emailTemplates");
const createNotification = require("../utils/createNotification");
const { successResponse, errorResponse } = require("../utils/apiResponse");

exports.applyForJob = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return errorResponse(res, 404, "Student profile not found");
    if (!student.resume) return errorResponse(res, 400, "Please upload resume before applying");

    const job = await Job.findById(req.params.jobId);
    if (!job || job.status !== "open") return errorResponse(res, 404, "Job not found or closed");
    if (new Date() > job.applicationDeadline) return errorResponse(res, 400, "Application deadline passed");

    const { minCGPA, maxBacklogs, branches } = job.eligibility;
    // Block placed students from applying
    if (student.placementStatus === "placed" || student.placementStatus === "dream_placed")
      return errorResponse(res, 400, "You are already placed. You cannot apply for more jobs.");
    if (student.cgpa < minCGPA) return errorResponse(res, 400, `Minimum CGPA required: ${minCGPA}`);
    if (student.backlogsCount > maxBacklogs) return errorResponse(res, 400, "You have active backlogs");
    if (branches.length && !branches.includes(student.branch))
      return errorResponse(res, 400, "Your branch is not eligible");

    const application = await Application.create({
      job: job._id,
      student: student._id,
      resume: student.resume,
      coverLetter: req.body.coverLetter || "",
    });

    await Job.findByIdAndUpdate(job._id, { $inc: { applicationsCount: 1 } });

    // Send confirmation email to student
    const studentUser = await User.findById(req.user._id);
    const company = await Company.findById(job.company);
    await sendEmail({
      to: studentUser.email,
      subject: `Application Submitted — ${job.title} at ${company.companyName}`,
      html: templates.applicationSubmitted({
        studentName: studentUser.name,
        jobTitle: job.title,
        companyName: company.companyName,
        deadline: job.applicationDeadline,
      }),
    });
    // Notify student
    await createNotification({
      recipient: req.user._id,
      title: "Application Submitted!",
      message: `You have successfully applied for ${job.title} at ${company.companyName}.`,
      type: "application",
      link: "/applications",
    });

    successResponse(res, 201, "Applied successfully!", { application });

    successResponse(res, 201, "Applied successfully!", { application });
  } catch (err) {
    if (err.code === 11000) return errorResponse(res, 400, "Already applied for this job");
    next(err);
  }
};

exports.getMyApplications = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    const applications = await Application.find({ student: student._id })
      .populate({ path: "job", populate: { path: "company", select: "companyName logo" } })
      .sort("-createdAt");
    successResponse(res, 200, "Applications fetched", { applications });
  } catch (err) {
    next(err);
  }
};

exports.getJobApplicants = async (req, res, next) => {
  try {
    const company = await Company.findOne({ user: req.user._id });
    const job = await Job.findOne({ _id: req.params.jobId, company: company._id });
    if (!job) return errorResponse(res, 403, "Unauthorized");

    const applications = await Application.find({ job: req.params.jobId })
      .populate({ path: "student", populate: { path: "user", select: "name email" } })
      .sort("-createdAt");

    successResponse(res, 200, "Applicants fetched", { applications });
  } catch (err) {
    next(err);
  }
};

exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, feedback, offeredCTC, currentRound, interviewDate } = req.body;

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      {
        status,
        feedback,
        offeredCTC: offeredCTC || 0,
        currentRound: currentRound || "Applied",
        interviewDate: interviewDate || null
      },
      { new: true }
    );
    if (!application) return errorResponse(res, 404, "Application not found");

    // ── Auto update student placement status ──────────────────────
    if (status === "selected") {
      const job = await Job.findById(application.job);

      await Student.findByIdAndUpdate(application.student, {
        placementStatus: "placed",
        placedCompany: job?.company || null,
        ctc: Number(offeredCTC) || 0,
      });
    }

    // Revert if rejected
    if (status === "rejected") {
      const student = await Student.findById(application.student);
      if (student?.placementStatus === "placed") {
        await Student.findByIdAndUpdate(application.student, {
          placementStatus: "not_placed",
          placedCompany: null,
          ctc: 0,
        });
      }
    }
    // ─────────────────────────────────────────────────────────────

    // Send status update email to student
    try {
      const populatedApp = await Application.findById(application._id)
        .populate({ path: "student", populate: { path: "user", select: "name email" } })
        .populate({ path: "job", populate: { path: "company", select: "companyName" } });

      await sendEmail({
        to: populatedApp.student.user.email,
        subject: `Application Update — ${populatedApp.job.title}`,
        html: templates.applicationStatusUpdated({
          studentName: populatedApp.student.user.name,
          jobTitle: populatedApp.job.title,
          companyName: populatedApp.job.company.companyName,
          status,
          feedback,
          offeredCTC,
        }),
      });
    } catch (emailErr) {
      console.error("Email error:", emailErr.message);
    }
    // Notify student about status change
    const appForNotif = await Application.findById(application._id)
      .populate({ path: "student", select: "user" })
      .populate({ path: "job", populate: { path: "company", select: "companyName" } });

    const notifMessages = {
      shortlisted: `You have been shortlisted for ${appForNotif.job.title} at ${appForNotif.job.company.companyName}!`,
      interview: `You have been called for an interview for ${appForNotif.job.title} at ${appForNotif.job.company.companyName}!`,
      selected: `🎉 Congratulations! You have been selected for ${appForNotif.job.title} at ${appForNotif.job.company.companyName} with CTC ₹${offeredCTC} LPA!`,
      rejected: `Your application for ${appForNotif.job.title} at ${appForNotif.job.company.companyName} was not selected.`,
    };

    if (notifMessages[status]) {
      await createNotification({
        recipient: appForNotif.student.user,
        title: `Application ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: notifMessages[status],
        type: "application",
        link: "/applications",
      });
    }

    successResponse(res, 200, "Status updated", { application });

    successResponse(res, 200, "Status updated", { application });
  } catch (err) {
    next(err);
  }
};

exports.withdrawApplication = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, student: student._id, status: "applied" },
      { status: "withdrawn" },
      { new: true }
    );
    if (!application) return errorResponse(res, 404, "Application not found or cannot be withdrawn");
    successResponse(res, 200, "Application withdrawn");
  } catch (err) {
    next(err);
  }
};