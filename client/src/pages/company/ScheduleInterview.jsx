import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import { interviewService } from "../../services/interviewService";
import toast from "react-hot-toast";
import { Calendar, Clock, Monitor, Building2 } from "lucide-react";

export default function ScheduleInterview() {
  const navigate  = useNavigate();
  const location  = useLocation();

  // Get applicationId and student name passed via navigation state
  const { applicationId, studentName, jobTitle } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    round:        "",
    date:         "",
    time:         "",
    mode:         "online",
    link:         "",
    venue:        "",
    instructions: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!applicationId) return toast.error("No application selected!");
    setLoading(true);
    try {
      await interviewService.schedule({ ...form, applicationId });
      toast.success("Interview scheduled successfully!");
      navigate("/company/interviews");
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Schedule Interview</h1>
        {studentName && (
          <p className="text-gray-500 mb-6">
            Scheduling interview for <span className="font-semibold text-gray-700">{studentName}</span>
            {jobTitle && <> — <span className="text-primary-600">{jobTitle}</span></>}
          </p>
        )}

        <form onSubmit={handleSubmit} className="card space-y-5">

          {/* Round */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interview Round</label>
            <input
              name="round"
              value={form.round}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g. Technical Round 1, HR Round"
              required
            />
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar size={14} className="inline mr-1" /> Date
              </label>
              <input
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                className="input-field"
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock size={14} className="inline mr-1" /> Time
              </label>
              <input
                name="time"
                type="time"
                value={form.time}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>

          {/* Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Interview Mode</label>
            <div className="flex gap-3">
              {["online", "offline"].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setForm({ ...form, mode: m })}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium capitalize transition-all ${
                    form.mode === m
                      ? "border-primary-600 bg-primary-50 text-primary-700"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}>
                  {m === "online"
                    ? <><Monitor size={16} /> Online</>
                    : <><Building2 size={16} /> Offline</>
                  }
                </button>
              ))}
            </div>
          </div>

          {/* Online Link */}
          {form.mode === "online" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Link
              </label>
              <input
                name="link"
                value={form.link}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. https://meet.google.com/xxx"
              />
            </div>
          )}

          {/* Offline Venue */}
          {form.mode === "offline" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
              <input
                name="venue"
                value={form.venue}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. Company Office, Block A, Room 101"
              />
            </div>
          )}

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instructions <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              name="instructions"
              value={form.instructions}
              onChange={handleChange}
              className="input-field h-24 resize-none"
              placeholder="e.g. Please carry your resume, ID proof. Dress code: Formal."
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? "Scheduling..." : "Schedule Interview"}
          </button>
        </form>
      </div>
    </div>
  );
}