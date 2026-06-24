import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "../../components/common/Navbar";
import api from "../../services/api";
import { applicationService } from "../../services/applicationService";
import { jobService } from "../../services/jobService";
import toast from "react-hot-toast";
import { MapPin, DollarSign, Calendar, Users, Bookmark } from "lucide-react";

export default function JobDetail() {
  const { id }          = useParams();
  const navigate        = useNavigate();
  const queryClient     = useQueryClient();
  const [applying, setApplying] = useState(false);

  const { data: jobData, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn:  () => api.get(`/jobs/${id}`).then(r => r.data.data.job),
  });

  const { data: profileData } = useQuery({
    queryKey: ["studentProfile"],
    queryFn:  () => api.get("/students/profile").then(r => r.data.data.student),
  });

  const { data: savedData } = useQuery({
    queryKey: ["savedJobs"],
    queryFn:  () => jobService.getSavedJobs().then(r => r.data.data),
  });

  const job      = jobData;
  const isPlaced = profileData?.placementStatus === "placed" ||
                   profileData?.placementStatus === "dream_placed";
  const isSaved  = (savedData?.savedJobs || []).some(j => j._id === id);

  const saveMutation = useMutation({
    mutationFn: () => isSaved ? jobService.unsaveJob(id) : jobService.saveJob(id),
    onSuccess:  () => {
      toast.success(isSaved ? "Job removed from saved!" : "Job saved!");
      queryClient.invalidateQueries(["savedJobs"]);
    },
  });

  const handleApply = async () => {
    setApplying(true);
    try {
      await applicationService.apply(id, {});
      toast.success("Applied successfully!");
      navigate("/applications");
    } catch (_) {
    } finally {
      setApplying(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400">Loading job details...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header Card */}
        <div className="card mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl font-bold text-primary-700">
                {job?.company?.companyName?.[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{job?.title}</h1>
                <p className="text-gray-500">
                  {job?.company?.companyName} · {job?.location}
                </p>
                <span className={`badge mt-1 capitalize ${
                  job?.type === "full_time"  ? "bg-blue-100 text-blue-700"     :
                  job?.type === "internship" ? "bg-purple-100 text-purple-700" :
                  "bg-orange-100 text-orange-700"
                }`}>
                  {job?.type?.replace("_", " ")}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap">

              {/* Save Button */}
              <button
                onClick={() => saveMutation.mutate()}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-medium text-sm transition-all ${
                  isSaved
                    ? "border-yellow-400 bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                    : "border-gray-200 text-gray-500 hover:border-yellow-400 hover:text-yellow-500"
                }`}>
                <Bookmark size={16} className={isSaved ? "fill-yellow-500" : ""} />
                {isSaved ? "Saved" : "Save Job"}
              </button>

              {/* Apply Button or Placed Message */}
              {isPlaced ? (
                <div className="bg-green-50 border border-green-200 rounded-xl px-6 py-2.5 text-center">
                  <p className="text-green-700 font-semibold text-sm">
                    🎉 You are already placed!
                  </p>
                  <p className="text-green-600 text-xs mt-0.5">
                    You cannot apply for more jobs.
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="btn-primary px-8 py-2.5">
                  {applying ? "Applying..." : "Apply Now"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <div className="card">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Job Description</h2>
              <p className="text-gray-600 leading-relaxed">{job?.description}</p>
            </div>

            {job?.skills?.length > 0 && (
              <div className="card">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map(s => (
                    <span key={s} className="badge bg-primary-50 text-primary-700 text-sm px-3 py-1">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {job?.rounds?.length > 0 && (
              <div className="card">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Interview Rounds</h2>
                <div className="flex flex-wrap gap-2">
                  {job.rounds.map((r, i) => (
                    <div key={i}
                      className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                      <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="text-sm text-gray-700">{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="card">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Job Details</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <DollarSign size={16} className="text-green-500 flex-shrink-0" />
                  <span className="text-gray-600">Salary:</span>
                  <span className="font-semibold text-green-600">₹{job?.salary} LPA</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin size={16} className="text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{job?.location}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar size={16} className="text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600">Deadline:</span>
                  <span className="font-medium">
                    {new Date(job?.applicationDeadline).toLocaleDateString()}
                  </span>
                </div>
                {job?.driveDate && (
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar size={16} className="text-blue-400 flex-shrink-0" />
                    <span className="text-gray-600">Drive Date:</span>
                    <span className="font-medium">
                      {new Date(job?.driveDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Users size={16} className="text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600">Applied:</span>
                  <span className="font-medium">{job?.applicationsCount} students</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Eligibility</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Min CGPA</span>
                  <span className="font-semibold">{job?.eligibility?.minCGPA}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Max Backlogs</span>
                  <span className="font-semibold">{job?.eligibility?.maxBacklogs}</span>
                </div>
                {job?.eligibility?.branches?.length > 0 && (
                  <div>
                    <p className="text-gray-500 mb-2">Eligible Branches</p>
                    <div className="flex flex-wrap gap-1">
                      {job.eligibility.branches.map(b => (
                        <span key={b} className="badge bg-gray-100 text-gray-600">{b}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {job?.company && (
              <div className="card">
                <h2 className="text-lg font-bold text-gray-900 mb-4">About Company</h2>
                <div className="space-y-2 text-sm">
                  <p className="font-semibold text-gray-800">{job.company.companyName}</p>
                  {job.company.industry && (
                    <p className="text-gray-500">Industry: {job.company.industry}</p>
                  )}
                  {job.company.location && (
                    <div className="flex items-center gap-1 text-gray-500">
                      <MapPin size={13} /> {job.company.location}
                    </div>
                  )}
                  {job.company.website && (
                    <a href={job.company.website} target="_blank" rel="noreferrer"
                      className="text-primary-600 hover:underline block">
                      Visit Website →
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}