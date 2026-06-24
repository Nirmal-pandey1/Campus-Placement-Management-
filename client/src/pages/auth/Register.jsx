import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { GraduationCap } from "lucide-react";

const BRANCHES = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL", "CHEM", "MBA"];

export default function Register() {
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [extra, setExtra] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleExtra = (e) => setExtra({ ...extra, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register({ ...form, ...extra, role });
      toast.success("Account created successfully!");
      if (user.role === "company") navigate("/company");
      else navigate("/");
    } catch (_) {
      // error shown by api interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-8">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="bg-primary-600 p-2 rounded-xl">
            <GraduationCap className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">CareerSync</h1>
            <p className="text-xs text-gray-500">A Digital Platform For Campus Recruitment</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">Create Account</h2>

        {/* Role Selector */}
        <div className="flex gap-2 mb-6 bg-gray-100 rounded-lg p-1">
          {["student", "company"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-2 rounded-md text-sm font-medium capitalize transition-all ${role === r
                  ? "bg-white shadow text-primary-700"
                  : "text-gray-500 hover:text-gray-700"
                }`}>
              {r === "student" ? "🎓 Student" : "🏢 Company"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Common Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {role === "student" ? "Full Name" : "Contact Person Name"}
            </label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="input-field"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="input-field"
              placeholder="Min 6 characters"
              minLength={6}
              required
            />
          </div>

          {/* Student Specific Fields */}
          {role === "student" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                <input
                  name="rollNumber"
                  onChange={handleExtra}
                  className="input-field"
                  placeholder="e.g. 21CS001"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                  <select name="branch" onChange={handleExtra} className="input-field" required>
                    <option value="">Select Branch</option>
                    {BRANCHES.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <input
                    name="year"
                    type="number"
                    min={1}
                    max={4}
                    onChange={handleExtra}
                    className="input-field"
                    placeholder="1 - 4"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CGPA</label>
                <input
                  name="cgpa"
                  type="number"
                  step="0.01"
                  min={0}
                  max={10}
                  onChange={handleExtra}
                  className="input-field"
                  placeholder="e.g. 8.5"
                  required
                />
              </div>
            </>
          )}

          {/* Company Specific Fields */}
          {role === "company" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  name="companyName"
                  onChange={handleExtra}
                  className="input-field"
                  placeholder="e.g. Google India"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <input
                  name="industry"
                  onChange={handleExtra}
                  className="input-field"
                  placeholder="e.g. IT, Finance, Core"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  name="location"
                  onChange={handleExtra}
                  className="input-field"
                  placeholder="e.g. Bangalore"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HR Name</label>
                <input
                  name="hrName"
                  onChange={handleExtra}
                  className="input-field"
                  placeholder="HR contact name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HR Email</label>
                <input
                  name="hrEmail"
                  type="email"
                  onChange={handleExtra}
                  className="input-field"
                  placeholder="hr@company.com"
                  required
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3">
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-primary-600 hover:underline font-medium">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
}