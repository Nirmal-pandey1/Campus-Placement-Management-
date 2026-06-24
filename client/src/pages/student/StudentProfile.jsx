import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "../../components/common/Navbar";
import api from "../../services/api";
import toast from "react-hot-toast";
import { User, Upload, Save } from "lucide-react";
import AvatarUpload from "../../components/common/AvatarUpload";
import { useAuth } from "../../context/AuthContext";

const BRANCHES = ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL", "CHEM", "MBA"];

export default function StudentProfile() {
  const queryClient        = useQueryClient();
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm]    = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ["studentProfile"],
    queryFn:  () => api.get("/students/profile").then(r => {
      const s = r.data.data.student;
      setForm(s);
      return s;
    }),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => api.put("/students/profile", {
      ...data,
      name: data.name || data.user?.name,
    }),
    onSuccess: () => {
      toast.success("Profile updated!");
      setEditing(false);
      if (form.name) updateUser({ name: form.name });
      queryClient.invalidateQueries(["studentProfile"]);
    },
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400">Loading profile...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <button
            onClick={() => editing ? updateMutation.mutate(form) : setEditing(true)}
            className="btn-primary flex items-center gap-2">
            {editing ? <><Save size={16} /> Save Changes</> : <><User size={16} /> Edit Profile</>}
          </button>
        </div>

        <div className="card space-y-6">

          {/* Avatar + Name */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
              Basic Information
            </h2>

            {/* Avatar Upload */}
            <div className="flex items-center gap-4 mb-5">
              <AvatarUpload
                user={user}
                role="student"
                onUpdate={(avatar) => updateUser({ avatar })}
              />
              <div>
                <p className="font-semibold text-gray-800">{user?.name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Click the camera icon to update your photo
                </p>
              </div>
            </div>

            {/* Full Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                name="name"
                value={form.user?.name || form.name || ""}
                onChange={e => setForm({ ...form, name: e.target.value, user: { ...form.user, name: e.target.value } })}
                disabled={!editing}
                className="input-field disabled:bg-gray-50"
                placeholder="Your full name"
              />
            </div>

            {/* Grid Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                <input name="rollNumber" value={form.rollNumber || ""} onChange={handleChange}
                  disabled={!editing} className="input-field disabled:bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                <select name="branch" value={form.branch || ""} onChange={handleChange}
                  disabled={!editing} className="input-field disabled:bg-gray-50">
                  {BRANCHES.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input name="year" type="number" value={form.year || ""} onChange={handleChange}
                  disabled={!editing} className="input-field disabled:bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CGPA</label>
                <input name="cgpa" type="number" step="0.01" value={form.cgpa || ""} onChange={handleChange}
                  disabled={!editing} className="input-field disabled:bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input name="phone" value={form.phone || ""} onChange={handleChange}
                  disabled={!editing} className="input-field disabled:bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Active Backlogs</label>
                <input name="backlogsCount" type="number" value={form.backlogsCount || 0} onChange={handleChange}
                  disabled={!editing} className="input-field disabled:bg-gray-50" />
              </div>
            </div>
          </div>

          {/* Online Profiles */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">
              Online Profiles
            </h2>
            <div className="space-y-3">
              {["linkedin", "github", "portfolio"].map(field => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {field}
                  </label>
                  <input
                    name={field}
                    value={form[field] || ""}
                    onChange={handleChange}
                    disabled={!editing}
                    className="input-field disabled:bg-gray-50"
                    placeholder={`https://${field}.com/yourprofile`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Resume */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Resume</h2>
            {form.resume && (
              <a href={form.resume} target="_blank" rel="noreferrer"
                className="text-primary-600 hover:underline text-sm font-medium block mb-3">
                📄 View Current Resume →
              </a>
            )}
            <div className="flex items-center gap-3">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.append("resume", file);
                    try {
                      const res = await api.post("/students/resume", formData, {
                        headers: { "Content-Type": "multipart/form-data" },
                      });
                      setForm(prev => ({ ...prev, resume: res.data.data.resume }));
                      toast.success("Resume uploaded successfully!");
                    } catch (_) {}
                  }}
                />
                <span className="btn-primary flex items-center gap-2 cursor-pointer">
                  <Upload size={16} />
                  {form.resume ? "Change Resume" : "Upload Resume"}
                </span>
              </label>
              <span className="text-xs text-gray-400">PDF, DOC, DOCX — max 5MB</span>
            </div>
          </div>

          {/* Placement Status */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b">
              Placement Status
            </h2>
            <span className={`badge text-sm font-medium capitalize ${
              form.placementStatus === "placed"       ? "bg-green-100 text-green-700" :
              form.placementStatus === "dream_placed" ? "bg-blue-100 text-blue-700"  :
              "bg-gray-100 text-gray-600"
            }`}>
              {form.placementStatus?.replace("_", " ") || "Not Placed"}
            </span>
            {form.ctc > 0 && (
              <p className="text-sm text-green-600 font-semibold mt-2">
                Offered CTC: ₹{form.ctc} LPA
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}