const Job         = require("../models/Job");
const Company     = require("../models/Company");
const { successResponse, errorResponse } = require("../utils/apiResponse");

exports.getAllJobs = async (req, res, next) => {
  try {
    const {
      type, branch, search,
      minSalary, maxSalary,
      location, skills,
      deadline, sort,
      minCGPA,
    } = req.query;

    const query = { isApproved: true, status: "open" };

    // Basic filters
    if (type)   query.type     = type;
    if (branch) query["eligibility.branches"] = { $in: [branch] };

    // Search by title or description
    if (search) query.$or = [
      { title:       { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];

    // Salary range
    if (minSalary) query.salary = { ...query.salary, $gte: Number(minSalary) };
    if (maxSalary) query.salary = { ...query.salary, $lte: Number(maxSalary) };

    // Location filter
    if (location) query.location = { $regex: location, $options: "i" };

    // Skills filter
    if (skills) {
      const skillsArr = skills.split(",").map(s => s.trim());
      query.skills    = { $in: skillsArr };
    }

    // CGPA eligibility filter
    if (minCGPA) query["eligibility.minCGPA"] = { $lte: Number(minCGPA) };

    // Deadline filter
    const now = new Date();
    if (deadline === "closing_soon") {
      const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      query.applicationDeadline = { $gte: now, $lte: threeDays };
    } else if (deadline === "this_week") {
      const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      query.applicationDeadline = { $gte: now, $lte: oneWeek };
    } else if (deadline === "this_month") {
      const oneMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      query.applicationDeadline = { $gte: now, $lte: oneMonth };
    } else {
      query.applicationDeadline = { $gte: now };
    }

    // Sort options
    let sortOption = "-createdAt";
    if (sort === "salary_high")  sortOption = "-salary";
    if (sort === "salary_low")   sortOption = "salary";
    if (sort === "deadline")     sortOption = "applicationDeadline";
    if (sort === "newest")       sortOption = "-createdAt";
    if (sort === "popular")      sortOption = "-applicationsCount";

    const jobs = await Job.find(query)
      .populate("company", "companyName logo location industry")
      .sort(sortOption);

    successResponse(res, 200, "Jobs fetched", { jobs, count: jobs.length });
  } catch (err) {
    next(err);
  }
};

exports.getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate("company");
    if (!job) return errorResponse(res, 404, "Job not found");
    successResponse(res, 200, "Job fetched", { job });
  } catch (err) {
    next(err);
  }
};

exports.createJob = async (req, res, next) => {
  try {
    const company = await Company.findOne({ user: req.user._id });
    if (!company) return errorResponse(res, 404, "Company profile not found");
    if (!req.user.isApproved) return errorResponse(res, 403, "Company not approved yet");

    const job = await Job.create({ company: company._id, ...req.body });
    successResponse(res, 201, "Job posted! Awaiting admin approval.", { job });
  } catch (err) {
    next(err);
  }
};

exports.updateJob = async (req, res, next) => {
  try {
    const company = await Company.findOne({ user: req.user._id });
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, company: company._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!job) return errorResponse(res, 404, "Job not found or unauthorized");
    successResponse(res, 200, "Job updated", { job });
  } catch (err) {
    next(err);
  }
};

exports.deleteJob = async (req, res, next) => {
  try {
    const company = await Company.findOne({ user: req.user._id });
    const job = await Job.findOneAndDelete({ _id: req.params.id, company: company._id });
    if (!job) return errorResponse(res, 404, "Job not found or unauthorized");
    successResponse(res, 200, "Job deleted");
  } catch (err) {
    next(err);
  }
};

exports.getMyJobs = async (req, res, next) => {
  try {
    const company = await Company.findOne({ user: req.user._id });
    const jobs = await Job.find({ company: company._id }).sort("-createdAt");
    successResponse(res, 200, "Jobs fetched", { jobs });
  } catch (err) {
    next(err);
  }
};