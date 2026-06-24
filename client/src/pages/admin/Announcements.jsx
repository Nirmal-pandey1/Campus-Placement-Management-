import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "../../components/common/Navbar";
import { announcementService } from "../../services/announcementService";
import toast from "react-hot-toast";
import { Megaphone, Trash2, Send, Users, GraduationCap, Building2 } from "lucide-react";

const PRIORITY_STYLES = {
  high:   { bg: "bg-red-100",    text: "text-red-700",    emoji: "🔴" },
  medium: { bg: "bg-yellow-100", text: "text-yellow-700", emoji: "🟡" },
  low:    { bg: "bg-green-100",  text: "text-green-700",  emoji: "🟢" },
};

export default function Announcements() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title:    "",
    message:  "",
    priority: "medium",
    target:   "all",
  });
  const [sending, setSending] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn:  () => announcementService.getAll().then(r => r.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => announcementService.delete(id),
    onSuccess:  () => {
      toast.success("Announcement deleted!");
      queryClient.invalidateQueries(["announcements"]);
    },
  });

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await announcementService.create(form);
      toast.success(res.data.message);
      setForm({ title: "", message: "", priority: "medium", target: "all" });
      queryClient.invalidateQueries(["announcements"]);
    } catch (_) {
    } finally {
      setSending(false);
    }
  };

  const announcements = data?.announcements || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl px-8 py-8 overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
          <div className="relative z-10">
            <p className="text-blue-200 text-sm font-medium mb-2 uppercase tracking-wide">
              CareerSync · Admin
            </p>
            <h1 className="text-3xl font-bold text-white mb-1">📢 Announcements</h1>
            <p className="text-blue-200">
              Send announcements to students and companies instantly.
            </p>
          </div>
        </div>

        {/* Create Announcement Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5">
            Create New Announcement
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. Campus Drive by TCS on March 20th"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                className="input-field h-32 resize-none"
                placeholder="Write your announcement message here..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="input-field">
                  <option value="high">🔴 High Priority</option>
                  <option value="medium">🟡 Medium Priority</option>
                  <option value="low">🟢 Low Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Send To
                </label>
                <select
                  name="target"
                  value={form.target}
                  onChange={handleChange}
                  className="input-field">
                  <option value="all">👥 Everyone</option>
                  <option value="students">🎓 Students Only</option>
                  <option value="companies">🏢 Companies Only</option>
                </select>
              </div>
            </div>

            {/* Preview */}
            {form.title && (
              <div className={`rounded-xl p-4 border ${
                form.priority === "high"   ? "bg-red-50 border-red-200"    :
                form.priority === "medium" ? "bg-yellow-50 border-yellow-200" :
                "bg-green-50 border-green-200"
              }`}>
                <p className="text-xs font-semibold text-gray-500 mb-1">PREVIEW</p>
                <p className="font-bold text-gray-900">
                  {PRIORITY_STYLES[form.priority].emoji} {form.title}
                </p>
                {form.message && (
                  <p className="text-sm text-gray-600 mt-1">{form.message}</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={sending}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              <Send size={16} />
              {sending ? "Sending..." : "Send Announcement"}
            </button>
          </form>
        </div>

        {/* Past Announcements */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Past Announcements
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({announcements.length})
            </span>
          </h2>

          {isLoading ? (
            <p className="text-center text-gray-400 py-8">Loading...</p>
          ) : announcements.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <Megaphone size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No announcements yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map(ann => {
                const style = PRIORITY_STYLES[ann.priority];
                return (
                  <div key={ann._id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className={`badge ${style.bg} ${style.text} font-semibold`}>
                            {style.emoji} {ann.priority.toUpperCase()}
                          </span>
                          <span className="badge bg-gray-100 text-gray-600 capitalize flex items-center gap-1">
                            {ann.target === "all"       ? <><Users size={10} /> Everyone</>         :
                             ann.target === "students"  ? <><GraduationCap size={10} /> Students</>  :
                             <><Building2 size={10} /> Companies</>}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(ann.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">{ann.title}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{ann.message}</p>
                      </div>
                      <button
                        onClick={() => {
                          if (window.confirm("Delete this announcement?"))
                            deleteMutation.mutate(ann._id);
                        }}
                        className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}