import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import { jobService } from "../../services/jobService";
import { useAuth } from "../../context/AuthContext";
import { Briefcase, Users, PlusCircle, TrendingUp } from "lucide-react";

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

export default function CompanyDashboard() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["myJobs"],
    queryFn:  () => jobService.getMyJobs().then(r => r.data.data),
  });

  const jobs = data?.jobs || [];
  const openJobs   = jobs.filter(j => j.status === "open").length;
  const totalApps  = jobs.reduce((sum, j) => sum + (j.applicationsCount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl px-8 py-10 overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-blue-200 text-sm font-medium mb-2 uppercase tracking-wide">
                CareerSync · Company Dashboard
              </p>
              <h1 className="text-3xl font-bold text-white mb-1">
                Welcome, {user?.name}! 🏢
              </h1>
              <p className="text-blue-200">
                Manage your job postings and find the best campus talent.
              </p>
            </div>
            <Link to="/company/post-job"
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-lg self-start md:self-auto">
              <PlusCircle size={18} /> Post New Job
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Briefcase}  label="Total Jobs Posted" value={jobs.length}  color="bg-blue-500"    />
          <StatCard icon={TrendingUp} label="Open Jobs"         value={openJobs}     color="bg-emerald-500" />
          <StatCard icon={Users}      label="Total Applicants"  value={totalApps}    color="bg-violet-500"  />
          <StatCard icon={Briefcase}  label="Closed Jobs"       value={jobs.length - openJobs} color="bg-orange-500" />
        </div>

        {/* Jobs Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">My Job Postings</h2>
            <Link to="/company/jobs" className="text-sm text-blue-600 hover:underline font-medium">
              Manage all →
            </Link>
          </div>

          {isLoading ? (
            <p className="text-gray-400 text-center py-8">Loading jobs...</p>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Briefcase size={40} className="mx-auto mb-2 opacity-30" />
              <p>No jobs posted yet.</p>
              <Link to="/company/post-job" className="text-blue-600 text-sm hover:underline mt-1 block">
                Post your first job →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.slice(0, 5).map(job => (
                <div key={job._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-semibold text-gray-800">{job.title}</p>
                    <p className="text-xs text-gray-400">
                      {job.location} · ₹{job.salary} LPA ·{" "}
                      Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      {job.applicationsCount} applicants
                    </span>
                    <span className={`badge capitalize ${
                      job.status === "open" ? "bg-green-100 text-green-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {job.isApproved ? job.status : "Pending Approval"}
                    </span>
                    <Link
                      to={`/company/jobs/${job._id}/applicants`}
                      className="btn-secondary text-xs py-1.5">
                      View Applicants
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center py-4 border-t border-gray-200">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-gray-600">CareerSync</span>
            {" "}— A Digital Platform For Campus Recruitment
          </p>
        </div>

      </div>
    </div>
  );
}