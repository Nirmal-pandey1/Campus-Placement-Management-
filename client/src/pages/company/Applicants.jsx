import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Navbar from "../../components/common/Navbar";
import { applicationService } from "../../services/applicationService";
import toast from "react-hot-toast";
import { User, FileText, DollarSign } from "lucide-react";

const STATUSES = ["applied", "shortlisted", "interview", "selected", "rejected"];

export default function Applicants() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["applicants", id],
    queryFn: () => applicationService.getApplicants(id).then(r => r.data.data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ appId, status, offeredCTC }) =>
      applicationService.updateStatus(appId, { status, offeredCTC }),
    onSuccess: () => {
      toast.success("Status updated!");
      queryClient.invalidateQueries(["applicants", id]);
    },
  });

  const applications = data?.applications || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Job Applicants
          <span className="ml-2 text-lg font-normal text-gray-400">
            ({applications.length} total)
          </span>
        </h1>

        {isLoading ? (
          <p className="text-center text-gray-400 py-12">Loading applicants...</p>
        ) : applications.length === 0 ? (
          <div className="card text-center py-16">
            <User size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No applicants yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map(app => (
              <ApplicantCard
                key={app._id}
                app={app}
                onUpdate={(status, offeredCTC) =>
                  updateMutation.mutate({ appId: app._id, status, offeredCTC })
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ApplicantCard({ app, onUpdate }) {
  const navigate = useNavigate();
  const [status, setStatus] = useState(app.status);
  const [offeredCTC, setOfferedCTC] = useState(app.offeredCTC || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(status, Number(offeredCTC) || 0);
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between flex-wrap gap-4">

        {/* Student Info */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center font-bold text-primary-700 text-lg">
            {app.student?.user?.name?.[0] || "?"}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{app.student?.user?.name}</p>
            <p className="text-sm text-gray-500">{app.student?.user?.email}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
              <span>Branch: {app.student?.branch}</span>
              <span>CGPA: {app.student?.cgpa}</span>
              <span>Year: {app.student?.year}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          {app.resume && (
            <a href={app.resume} target="_blank" rel="noreferrer"
              className="flex items-center gap-1 btn-secondary text-sm py-1.5">
              <FileText size={14} /> Resume
            </a>
          )}
          {app.status === "shortlisted" || app.status === "interview" ? (
            <button
              onClick={() => navigate("/company/schedule-interview", {
                state: {
                  applicationId: app._id,
                  studentName: app.student?.user?.name,
                  jobTitle: app.job?.title,
                }
              })}
              className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium px-3 py-1.5 rounded-lg text-sm transition-colors">
              📅 Schedule Interview
            </button>
          ) : null}
        </div>
      </div>

      {/* Status + CTC Update Row */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3 flex-wrap">

        {/* Status Dropdown */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="input-field w-40 text-sm py-1.5">
            {STATUSES.map(s => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
        </div>

        {/* CTC Input — show only when selected */}
        {status === "selected" && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">Offered CTC (LPA)</label>
            <div className="relative">
              <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                value={offeredCTC}
                onChange={e => setOfferedCTC(e.target.value)}
                className="input-field pl-8 w-36 text-sm py-1.5"
                placeholder="e.g. 12"
                min={0}
              />
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-transparent">Save</label>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary text-sm py-1.5 px-5">
            {saving ? "Saving..." : "Update"}
          </button>
        </div>

        {/* Current Status Badge */}
        <div className="flex flex-col gap-1 ml-auto">
          <label className="text-xs font-medium text-gray-500">Current</label>
          <span className={`badge capitalize font-medium ${app.status === "selected" ? "bg-green-100 text-green-700" :
              app.status === "rejected" ? "bg-red-100 text-red-600" :
                app.status === "shortlisted" ? "bg-blue-100 text-blue-700" :
                  app.status === "interview" ? "bg-purple-100 text-purple-700" :
                    "bg-gray-100 text-gray-600"
            }`}>
            {app.status}
            {app.offeredCTC > 0 && ` · ₹${app.offeredCTC} LPA`}
          </span>
        </div>

      </div>
    </div>
  );
}