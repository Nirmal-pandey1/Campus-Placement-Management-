import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import { jobService } from "../../services/jobService";
import toast from "react-hot-toast";
import { Briefcase, Trash2, Users } from "lucide-react";

export default function ManageJobs() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["myJobs"],
    queryFn:  () => jobService.getMyJobs().then(r => r.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => jobService.delete(id),
    onSuccess: () => {
      toast.success("Job deleted");
      queryClient.invalidateQueries(["myJobs"]);
    },
  });

  const jobs = data?.jobs || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manage Jobs</h1>
          <Link to="/company/post-job" className="btn-primary flex items-center gap-2">
            + Post New Job
          </Link>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-400 py-12">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <div className="card text-center py-16">
            <Briefcase size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No jobs posted yet</p>
            <Link to="/company/post-job" className="text-blue-600 text-sm hover:underline mt-1 block">
              Post your first job →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => (
              <div key={job._id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{job.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {job.location} · ₹{job.salary} LPA ·{" "}
                      <span className="capitalize">{job.type.replace("_", " ")}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`badge ${
                      !job.isApproved              ? "bg-yellow-100 text-yellow-700" :
                      job.status === "open"        ? "bg-green-100 text-green-700"   :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {!job.isApproved ? "Pending Approval" : job.status}
                    </span>

                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <Users size={14} /> {job.applicationsCount} applicants
                    </span>

                    <Link
                      to={`/company/jobs/${job._id}/applicants`}
                      className="btn-secondary text-sm py-1.5">
                      View Applicants
                    </Link>

                    <button
                      onClick={() => {
                        if (window.confirm("Delete this job?"))
                          deleteMutation.mutate(job._id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}