import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import { jobService } from "../../services/jobService";
import toast from "react-hot-toast";
import {
  Bookmark, BookmarkX, MapPin,
  DollarSign, Calendar, Briefcase
} from "lucide-react";

export default function SavedJobs() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["savedJobs"],
    queryFn:  () => jobService.getSavedJobs().then(r => r.data.data),
  });

  const unsaveMutation = useMutation({
    mutationFn: (jobId) => jobService.unsaveJob(jobId),
    onSuccess:  () => {
      toast.success("Job removed from saved!");
      queryClient.invalidateQueries(["savedJobs"]);
      queryClient.invalidateQueries(["studentProfile"]);
    },
  });

  const savedJobs = data?.savedJobs || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
            <Bookmark size={20} className="text-yellow-600 fill-yellow-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Saved Jobs</h1>
            <p className="text-gray-500 text-sm">
              {savedJobs.length} job{savedJobs.length !== 1 ? "s" : ""} bookmarked
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : savedJobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <Bookmark size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium text-lg">No saved jobs yet</p>
            <p className="text-gray-400 text-sm mt-1 mb-6">
              Bookmark jobs you're interested in to view them later!
            </p>
            <Link to="/jobs" className="btn-primary px-8 py-2.5 inline-flex items-center gap-2">
              <Briefcase size={16} /> Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {savedJobs.map(job => (
              <div key={job._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 group">

                <div className="p-5 pb-3">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-primary-700 text-lg">
                        {job.company?.companyName?.[0] || "?"}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-primary-700 transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-sm text-gray-500">{job.company?.companyName}</p>
                      </div>
                    </div>

                    {/* Unsave Button */}
                    <button
                      onClick={() => unsaveMutation.mutate(job._id)}
                      title="Remove from saved"
                      className="p-2 text-yellow-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <BookmarkX size={18} />
                    </button>
                  </div>

                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin size={13} /> {job.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-600 font-semibold">
                      <DollarSign size={13} /> ₹{job.salary} LPA
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar size={13} />
                      Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                      {new Date(job.applicationDeadline) - new Date() < 3 * 24 * 60 * 60 * 1000 && (
                        <span className="badge bg-red-100 text-red-600 text-xs ml-1">
                          Closing Soon!
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {job.skills?.slice(0, 3).map(s => (
                      <span key={s} className="badge bg-gray-100 text-gray-600 text-xs">{s}</span>
                    ))}
                    {job.skills?.length > 3 && (
                      <span className="badge bg-gray-100 text-gray-400 text-xs">
                        +{job.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="px-5 pb-5 flex items-center justify-between">
                  <span className={`badge capitalize text-xs ${
                    job.type === "full_time"  ? "bg-blue-100 text-blue-700"     :
                    job.type === "internship" ? "bg-purple-100 text-purple-700" :
                    "bg-orange-100 text-orange-700"
                  }`}>
                    {job.type?.replace("_", " ")}
                  </span>
                  <Link
                    to={`/jobs/${job._id}`}
                    className="btn-primary text-sm py-1.5 px-4">
                    View & Apply
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}