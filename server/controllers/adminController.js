const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const templates = require("../utils/emailTemplates");
const Student = require("../models/Student");
const Company = require("../models/Company");
const Job = require("../models/Job");
const Interview     = require("../models/Interview");
const Notification  = require("../models/Notification");
const Application = require("../models/Application");
const createNotification = require("../utils/createNotification");
const { successResponse, errorResponse } = require("../utils/apiResponse");

exports.getDashboardStats = async (req, res, next) => {
  try {
    const [totalStudents, placedStudents, totalCompanies, totalJobs, totalApplications] =
      await Promise.all([
        Student.countDocuments(),
        Student.countDocuments({ placementStatus: { $ne: "not_placed" } }),
        Company.countDocuments(),
        Job.countDocuments({ isApproved: true }),
        Application.countDocuments(),
      ]);

    const placementRate = totalStudents
      ? ((placedStudents / totalStudents) * 100).toFixed(1)
      : 0;

    successResponse(res, 200, "Stats fetched", {
      totalStudents, placedStudents, placementRate,
      totalCompanies, totalJobs, totalApplications,
    });
  } catch (err) {
    next(err);
  }
};

exports.approveCompany = async (req, res, next) => {
  try {
    const { isApproved } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true }
    );
    if (!user) return errorResponse(res, 404, "Company not found");

    // Send email to company
    const company = await Company.findOne({ user: user._id });
    if (company) {
      await sendEmail({
        to: user.email,
        subject: isApproved ? "🎉 Company Approved on CareerSync!" : "Company Registration Update",
        html: templates.companyApprovalStatus({
          companyName: company.companyName,
          hrName: company.hrName,
          isApproved,
        }),
      });
    }
    // Notify company
    await createNotification({
      recipient: user._id,
      title: isApproved ? "Company Approved! 🎉" : "Company Registration Update",
      message: isApproved
        ? "Your company has been approved! You can now post jobs."
        : "Your company registration was rejected. Contact the placement office.",
      type: "system",
      link: "/company",
    });

    successResponse(res, 200, `Company ${isApproved ? "approved" : "rejected"}`, { user });
  } catch (err) {
    next(err);
  }
};

exports.approveJob = async (req, res, next) => {
  try {
    const { isApproved } = req.body;
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true }
    ).populate("company");

    if (!job) return errorResponse(res, 404, "Job not found");

    // Send email to company HR
    const companyUser = await User.findById(job.company.user);
    if (companyUser) {
      await sendEmail({
        to: companyUser.email,
        subject: isApproved ? `✅ Job Approved — ${job.title}` : `Job Posting Update — ${job.title}`,
        html: templates.jobApprovalStatus({
          hrName: job.company.hrName,
          jobTitle: job.title,
          companyName: job.company.companyName,
          isApproved,
        }),
      });
    }
    // Notify company HR
    await createNotification({
      recipient: job.company.user,
      title: isApproved ? "Job Approved! ✅" : "Job Posting Update",
      message: isApproved
        ? `Your job posting "${job.title}" has been approved and is now live!`
        : `Your job posting "${job.title}" was rejected by admin.`,
      type: "job",
      link: "/company/jobs",
    });

    successResponse(res, 200, `Job ${isApproved ? "approved" : "rejected"}`, { job });
  } catch (err) {
    next(err);
  }
};

exports.getAllStudents = async (req, res, next) => {
  try {
    const students = await Student.find().populate("user", "name email isVerified");
    successResponse(res, 200, "Students fetched", { students, count: students.length });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the user first
    const user = await User.findById(id);
    if (!user) return errorResponse(res, 404, "User not found");

    // Delete everything related to this user
    if (user.role === "student") {
      const student = await Student.findOne({ user: id });
      if (student) {
        await Application.deleteMany({ student: student._id });
        await Interview.deleteMany({ student: student._id });
        await Student.findOneAndDelete({ user: id });
      }
    }

    if (user.role === "company") {
      const company = await Company.findOne({ user: id });
      if (company) {
        await Job.deleteMany({ company: company._id });
        await Company.findOneAndDelete({ user: id });
      }
    }

    // Delete notifications and conversations
    await Notification.deleteMany({ recipient: id });

    // Delete the user
    await User.findByIdAndDelete(id);

    successResponse(res, 200, "User deleted successfully");
  } catch (err) {
    next(err);
  }
};

exports.getAllCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find().populate("user", "name email isApproved");
    successResponse(res, 200, "Companies fetched", { companies, count: companies.length });
  } catch (err) {
    next(err);
  }
};

exports.getAllJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find()
      .populate("company", "companyName logo location")
      .sort("-createdAt");
    successResponse(res, 200, "Jobs fetched", { jobs, count: jobs.length });
  } catch (err) {
    next(err);
  }
};

exports.getPlacementReport = async (req, res, next) => {
  try {
    // Branch-wise stats
    const branchWise = await Student.aggregate([
      {
        $group: {
          _id: "$branch",
          total: { $sum: 1 },
          placed: { $sum: { $cond: [{ $ne: ["$placementStatus", "not_placed"] }, 1, 0] } },
          avgCTC: { $avg: "$ctc" },
        }
      },
      { $sort: { total: -1 } },
    ]);

    // Top CTC students
    const topCTC = await Student.find({ placementStatus: { $ne: "not_placed" } })
      .populate("user", "name")
      .populate("placedCompany", "companyName")
      .sort("-ctc")
      .limit(10);

    // CTC distribution
    const ctcDistribution = await Student.aggregate([
      { $match: { placementStatus: { $ne: "not_placed" }, ctc: { $gt: 0 } } },
      {
        $bucket: {
          groupBy: "$ctc",
          boundaries: [0, 5, 10, 15, 20, 30, 100],
          default: "30+",
          output: { count: { $sum: 1 } },
        }
      },
    ]);

    // Company-wise hiring
    const companyWise = await Student.aggregate([
      { $match: { placementStatus: { $ne: "not_placed" }, placedCompany: { $ne: null } } },
      { $group: { _id: "$placedCompany", hired: { $sum: 1 }, avgCTC: { $avg: "$ctc" } } },
      { $lookup: { from: "companies", localField: "_id", foreignField: "_id", as: "company" } },
      { $unwind: "$company" },
      { $project: { companyName: "$company.companyName", hired: 1, avgCTC: 1 } },
      { $sort: { hired: -1 } },
      { $limit: 8 },
    ]);

    // Month-wise applications trend
    const monthWise = await Application.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          applications: { $sum: 1 },
          selected: { $sum: { $cond: [{ $eq: ["$status", "selected"] }, 1, 0] } },
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]);

    // Job type distribution
    const jobTypeWise = await Application.aggregate([
      { $lookup: { from: "jobs", localField: "job", foreignField: "_id", as: "jobData" } },
      { $unwind: "$jobData" },
      { $group: { _id: "$jobData.type", count: { $sum: 1 } } },
    ]);

    // Overall stats
    const totalStudents = await Student.countDocuments();
    const placedStudents = await Student.countDocuments({ placementStatus: { $ne: "not_placed" } });
    const avgCTCResult = await Student.aggregate([
      { $match: { ctc: { $gt: 0 } } },
      { $group: { _id: null, avgCTC: { $avg: "$ctc" }, maxCTC: { $max: "$ctc" } } },
    ]);

    successResponse(res, 200, "Report fetched", {
      branchWise,
      topCTC,
      ctcDistribution,
      companyWise,
      monthWise,
      jobTypeWise,
      overview: {
        totalStudents,
        placedStudents,
        placementRate: totalStudents ? ((placedStudents / totalStudents) * 100).toFixed(1) : 0,
        avgCTC: avgCTCResult[0]?.avgCTC?.toFixed(2) || 0,
        maxCTC: avgCTCResult[0]?.maxCTC || 0,
      },
    });
  } catch (err) {
    next(err);
  }
};