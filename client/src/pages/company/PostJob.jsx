import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import { jobService } from "../../services/jobService";
import toast from "react-hot-toast";

const BRANCHES = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL", "CHEM", "MBA"];

export default function PostJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", type: "full_time",
    location: "", salary: "", stipend: "",
    applicationDeadline: "", driveDate: "",
    skills: "", rounds: "",
    eligibility: { minCGPA: 0, maxBacklogs: 0, branches: [], yearOfPassing: "" },
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleEligibility = (e) =>
    setForm({ ...form, eligibility: { ...form.eligibility, [e.target.name]: e.target.value } });

  const handleBranches = (branch) => {
    const branches = form.eligibility.branches.includes(branch)
      ? form.eligibility.branches.filter(b => b !== branch)
      : [...form.eligibility.branches, branch];
    setForm({ ...form, eligibility: { ...form.eligibility, branches } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        skills:  form.skills.split(",").map(s => s.trim()).filter(Boolean),
        rounds:  form.rounds.split(",").map(r => r.trim()).filter(Boolean),
      };
      await jobService.create(payload);
      toast.success("Job posted! Awaiting admin approval.");
      navigate("/company/jobs");
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Post a New Job</h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Basic Details */}
          <div className="card space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Job Details</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
              <input name="title" value={form.title} onChange={handleChange}
                className="input-field" placeholder="e.g. Software Engineer" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                className="input-field h-32 resize-none"
                placeholder="Describe the role, responsibilities..." required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                <select name="type" value={form.type} onChange={handleChange} className="input-field">
                  <option value="full_time">Full Time</option>
                  <option value="internship">Internship</option>
                  <option value="ppo">PPO</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input name="location" value={form.location} onChange={handleChange}
                  className="input-field" placeholder="e.g. Bangalore" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CTC / Salary (LPA)
                </label>
                <input name="salary" type="number" value={form.salary} onChange={handleChange}
                  className="input-field" placeholder="e.g. 12" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stipend (if internship)
                </label>
                <input name="stipend" type="number" value={form.stipend} onChange={handleChange}
                  className="input-field" placeholder="e.g. 20000" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Application Deadline
                </label>
                <input name="applicationDeadline" type="date" value={form.applicationDeadline}
                  onChange={handleChange} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Drive Date</label>
                <input name="driveDate" type="date" value={form.driveDate}
                  onChange={handleChange} className="input-field" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Required Skills (comma separated)
              </label>
              <input name="skills" value={form.skills} onChange={handleChange}
                className="input-field" placeholder="e.g. React, Node.js, MongoDB" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interview Rounds (comma separated)
              </label>
              <input name="rounds" value={form.rounds} onChange={handleChange}
                className="input-field" placeholder="e.g. Aptitude, Technical, HR" />
            </div>
          </div>

          {/* Eligibility */}
          <div className="card space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Eligibility Criteria</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum CGPA</label>
                <input name="minCGPA" type="number" step="0.1"
                  value={form.eligibility.minCGPA} onChange={handleEligibility}
                  className="input-field" placeholder="e.g. 7.0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Backlogs Allowed</label>
                <input name="maxBacklogs" type="number"
                  value={form.eligibility.maxBacklogs} onChange={handleEligibility}
                  className="input-field" placeholder="e.g. 0" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Eligible Branches</label>
              <div className="flex flex-wrap gap-2">
                {BRANCHES.map(b => (
                  <button key={b} type="button" onClick={() => handleBranches(b)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                      form.eligibility.branches.includes(b)
                        ? "bg-primary-600 text-white border-primary-600"
                        : "bg-white text-gray-600 border-gray-300 hover:border-primary-400"
                    }`}>
                    {b}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Select none to allow all branches
              </p>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? "Posting Job..." : "Post Job"}
          </button>
        </form>
      </div>
    </div>
  );
}