import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "../../components/common/Navbar";
import { adminService } from "../../services/adminService";
import api from "../../services/api";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, Briefcase, MapPin, DollarSign, Calendar } from "lucide-react";

export default function ManageJobsAdmin() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["adminAllJobs"],
    queryFn:  () => api.get("/admin/all-jobs").then(r => r.data.data),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, status }) => adminService.approveJob(id, status),
    onSuccess: () => {
      toast.success("Job status updated!");
      queryClient.invalidateQueries(["adminAllJobs"]);
    },
  });

  const jobs = data?.jobs || [];
  const pendingJobs  = jobs.filter(j => !j.isApproved);
  const approvedJobs = jobs.filter(j => j.isApproved);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        <h1 className="text-2xl font-bold text-gray-900">
          Manage Jobs
          <span className="ml-2 text-lg font-normal text-gray-400">({jobs.length} total)</span>
        </h1>

        {isLoading ? (
          <p className="text-center text-gray-400 py-12">Loading jobs...</p>
        ) : (
          <>
            {/* Pending Approval */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-1 w-8 rounded-full bg-yellow-500" />
                <h2 className="text-lg font-bold text-gray-900">
                  Pending Approval
                  <span className="ml-2 text-sm font-normal text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                    {pendingJobs.length} jobs
                  </span>
                </h2>
              </div>

              {pendingJobs.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
                  <CheckCircle size={40} className="mx-auto mb-2 text-green-300" />
                  <p>No pending jobs — all caught up!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingJobs.map(job => (
                    <JobCard
                      key={job._id}
                      job={job}
                      onApprove={() => approveMutation.mutate({ id: job._id, status: true  })}
                      onReject={()  => approveMutation.mutate({ id: job._id, status: false })}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Approved Jobs */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-1 w-8 rounded-full bg-green-500" />
                <h2 className="text-lg font-bold text-gray-900">
                  Approved Jobs
                  <span className="ml-2 text-sm font-normal text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    {approvedJobs.length} jobs
                  </span>
                </h2>
              </div>

              {approvedJobs.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
                  <Briefcase size={40} className="mx-auto mb-2 opacity-30" />
                  <p>No approved jobs yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {approvedJobs.map(job => (
                    <JobCard
                      key={job._id}
                      job={job}
                      approved
                      onReject={() => approveMutation.mutate({ id: job._id, status: false })}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function JobCard({ job, approved, onApprove, onReject }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center font-bold text-primary-700 text-lg">
            {job.company?.companyName?.[0] || "?"}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{job.title}</h3>
            <p className="text-sm text-gray-500">{job.company?.companyName}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <MapPin size={11} /> {job.location}
              </span>
              <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                <DollarSign size={11} /> ₹{job.salary} LPA
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar size={11} />
                {new Date(job.applicationDeadline).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span className={`badge capitalize ${
            job.type === "full_time"  ? "bg-blue-100 text-blue-700"     :
            job.type === "internship" ? "bg-purple-100 text-purple-700" :
            "bg-orange-100 text-orange-700"
          }`}>
            {job.type.replace("_", " ")}
          </span>

          <span className={`badge ${
            approved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
          }`}>
            {approved ? "Approved" : "Pending"}
          </span>

          {!approved && (
            <button
              onClick={onApprove}
              className="flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-700 font-medium px-3 py-1.5 rounded-lg text-sm transition-colors">
              <CheckCircle size={15} /> Approve
            </button>
          )}

          <button
            onClick={onReject}
            className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 font-medium px-3 py-1.5 rounded-lg text-sm transition-colors">
            <XCircle size={15} /> {approved ? "Revoke" : "Reject"}
          </button>
        </div>
      </div>

      {/* Skills */}
      {job.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-gray-50">
          {job.skills.map(s => (
            <span key={s} className="badge bg-gray-100 text-gray-600 text-xs">{s}</span>
          ))}
        </div>
      )}
    </div>
  );
}