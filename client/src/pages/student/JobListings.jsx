import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import api from "../../services/api";
import { jobService } from "../../services/jobService";
import toast from "react-hot-toast";
import {
  Search, MapPin, DollarSign, Calendar,
  X, ChevronDown, ChevronUp, Briefcase,
  TrendingUp, CheckCircle, SlidersHorizontal, Bookmark,
} from "lucide-react";

const LOCATIONS = ["Bangalore", "Mumbai", "Hyderabad", "Chennai", "Pune", "Delhi", "Remote", "Noida"];
const SKILLS    = ["React", "Node.js", "Python", "Java", "JavaScript", "MongoDB", "SQL", "AWS", "Flutter", "Django"];

const DEFAULT_FILTERS = {
  search: "", type: "", location: "",
  minSalary: "", maxSalary: "", skills: [],
  deadline: "", sort: "newest", minCGPA: "",
};

export default function JobListings() {
  const queryClient = useQueryClient();
  const [filters, setFilters]               = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [showFilters, setShowFilters]       = useState(false);
  const [activeCount, setActiveCount]       = useState(0);

  // Get applied jobs
  const { data: appsData } = useQuery({
    queryKey: ["myApplications"],
    queryFn:  () => api.get("/applications/my").then(r => r.data.data),
  });

  // Get saved jobs
  const { data: savedData } = useQuery({
    queryKey: ["savedJobs"],
    queryFn:  () => jobService.getSavedJobs().then(r => r.data.data),
  });

  const appliedJobIds = new Set(
    (appsData?.applications || []).map(a => a.job?._id)
  );

  const savedJobIds = new Set(
    (savedData?.savedJobs || []).map(j => j._id)
  );

  // Fetch jobs with filters
  const { data, isLoading } = useQuery({
    queryKey: ["jobs", appliedFilters],
    queryFn: () => {
      const params = { ...appliedFilters };
      if (params.skills.length) params.skills = params.skills.join(",");
      else delete params.skills;
      Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
      return api.get("/jobs", { params }).then(r => r.data.data);
    },
  });

  const jobs = data?.jobs || [];

  // Save job mutation
  const saveMutation = useMutation({
    mutationFn: (jobId) => jobService.saveJob(jobId),
    onSuccess:  () => {
      toast.success("Job saved!");
      queryClient.invalidateQueries(["savedJobs"]);
    },
  });

  // Unsave job mutation
  const unsaveMutation = useMutation({
    mutationFn: (jobId) => jobService.unsaveJob(jobId),
    onSuccess:  () => {
      toast.success("Job removed from saved!");
      queryClient.invalidateQueries(["savedJobs"]);
    },
  });

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (appliedFilters.type)              count++;
    if (appliedFilters.location)          count++;
    if (appliedFilters.minSalary)         count++;
    if (appliedFilters.maxSalary)         count++;
    if (appliedFilters.skills.length)     count++;
    if (appliedFilters.deadline)          count++;
    if (appliedFilters.minCGPA)           count++;
    if (appliedFilters.sort !== "newest") count++;
    setActiveCount(count);
  }, [appliedFilters]);

  const handleFilterChange = (key, value) =>
    setFilters(prev => ({ ...prev, [key]: value }));

  const toggleSkill = (skill) =>
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setFilters(p    => ({ ...p, search: val }));
    setAppliedFilters(p => ({ ...p, search: val }));
  };

  const handleSort = (e) => {
    const val = e.target.value;
    setFilters(p    => ({ ...p, sort: val }));
    setAppliedFilters(p => ({ ...p, sort: val }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Browse Jobs</h1>
          <p className="text-gray-500 mt-1">
            {isLoading ? "Loading..." : `${jobs.length} jobs found`}
          </p>
        </div>

        {/* Search + Sort + Filter Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                value={filters.search}
                onChange={handleSearch}
                className="input-field pl-10"
                placeholder="Search job title or description..."
              />
            </div>
            <select value={filters.sort} onChange={handleSort} className="input-field sm:w-44">
              <option value="newest">Newest First</option>
              <option value="salary_high">Highest Salary</option>
              <option value="salary_low">Lowest Salary</option>
              <option value="deadline">Deadline Soon</option>
              <option value="popular">Most Applied</option>
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium text-sm transition-all ${
                activeCount > 0
                  ? "bg-primary-600 text-white border-primary-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-primary-400"
              }`}>
              <SlidersHorizontal size={16} />
              Filters
              {activeCount > 0 && (
                <span className="w-5 h-5 bg-white text-primary-600 rounded-full text-xs font-bold flex items-center justify-center">
                  {activeCount}
                </span>
              )}
              {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Job Type</label>
                  <select value={filters.type} onChange={e => handleFilterChange("type", e.target.value)} className="input-field text-sm">
                    <option value="">All Types</option>
                    <option value="full_time">Full Time</option>
                    <option value="internship">Internship</option>
                    <option value="ppo">PPO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Location</label>
                  <select value={filters.location} onChange={e => handleFilterChange("location", e.target.value)} className="input-field text-sm">
                    <option value="">All Locations</option>
                    {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Application Deadline</label>
                  <select value={filters.deadline} onChange={e => handleFilterChange("deadline", e.target.value)} className="input-field text-sm">
                    <option value="">Any Deadline</option>
                    <option value="closing_soon">Closing Soon (3 days)</option>
                    <option value="this_week">This Week</option>
                    <option value="this_month">This Month</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Min Salary (LPA)</label>
                  <input type="number" value={filters.minSalary} onChange={e => handleFilterChange("minSalary", e.target.value)}
                    className="input-field text-sm" placeholder="e.g. 5" min={0} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Max Salary (LPA)</label>
                  <input type="number" value={filters.maxSalary} onChange={e => handleFilterChange("maxSalary", e.target.value)}
                    className="input-field text-sm" placeholder="e.g. 20" min={0} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">My CGPA (eligible only)</label>
                  <input type="number" step="0.1" value={filters.minCGPA} onChange={e => handleFilterChange("minCGPA", e.target.value)}
                    className="input-field text-sm" placeholder="e.g. 7.5" min={0} max={10} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Skills</label>
                <div className="flex flex-wrap gap-2">
                  {SKILLS.map(skill => (
                    <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                        filters.skills.includes(skill)
                          ? "bg-primary-600 text-white border-primary-600"
                          : "bg-white text-gray-600 border-gray-300 hover:border-primary-400"
                      }`}>
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button onClick={handleApplyFilters} className="btn-primary px-6">Apply Filters</button>
                <button onClick={handleClearFilters} className="btn-secondary px-6 flex items-center gap-2">
                  <X size={15} /> Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Active Filter Tags */}
        {activeCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {appliedFilters.type && (
              <FilterTag label={`Type: ${appliedFilters.type.replace("_", " ")}`}
                onRemove={() => { setFilters(p => ({...p, type: ""})); setAppliedFilters(p => ({...p, type: ""})); }} />
            )}
            {appliedFilters.location && (
              <FilterTag label={`Location: ${appliedFilters.location}`}
                onRemove={() => { setFilters(p => ({...p, location: ""})); setAppliedFilters(p => ({...p, location: ""})); }} />
            )}
            {appliedFilters.minSalary && (
              <FilterTag label={`Min: ₹${appliedFilters.minSalary} LPA`}
                onRemove={() => { setFilters(p => ({...p, minSalary: ""})); setAppliedFilters(p => ({...p, minSalary: ""})); }} />
            )}
            {appliedFilters.maxSalary && (
              <FilterTag label={`Max: ₹${appliedFilters.maxSalary} LPA`}
                onRemove={() => { setFilters(p => ({...p, maxSalary: ""})); setAppliedFilters(p => ({...p, maxSalary: ""})); }} />
            )}
            {appliedFilters.deadline && (
              <FilterTag label={`Deadline: ${appliedFilters.deadline.replace("_", " ")}`}
                onRemove={() => { setFilters(p => ({...p, deadline: ""})); setAppliedFilters(p => ({...p, deadline: ""})); }} />
            )}
            {appliedFilters.minCGPA && (
              <FilterTag label={`CGPA ≥ ${appliedFilters.minCGPA}`}
                onRemove={() => { setFilters(p => ({...p, minCGPA: ""})); setAppliedFilters(p => ({...p, minCGPA: ""})); }} />
            )}
            {appliedFilters.skills.map(skill => (
              <FilterTag key={skill} label={skill}
                onRemove={() => {
                  const updated = appliedFilters.skills.filter(s => s !== skill);
                  setFilters(p    => ({...p, skills: updated}));
                  setAppliedFilters(p => ({...p, skills: updated}));
                }} />
            ))}
            <button onClick={handleClearFilters} className="text-xs text-red-500 hover:underline font-medium px-2">
              Clear all
            </button>
          </div>
        )}

        {/* Job Cards */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
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
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase size={56} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium text-lg">No jobs found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
            <button onClick={handleClearFilters} className="btn-primary mt-4 px-6">Clear Filters</button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {jobs.map(job => {
              const isApplied = appliedJobIds.has(job._id);
              const isSaved   = savedJobIds.has(job._id);
              return (
                <div key={job._id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 group">
                  <div className="p-5 pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-primary-700 text-lg flex-shrink-0">
                          {job.company?.companyName?.[0]}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-900 group-hover:text-primary-700 transition-colors line-clamp-1">
                            {job.title}
                          </h3>
                          <p className="text-sm text-gray-500 line-clamp-1">{job.company?.companyName}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                        {/* Bookmark Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            isSaved ? unsaveMutation.mutate(job._id) : saveMutation.mutate(job._id);
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isSaved
                              ? "text-yellow-500 bg-yellow-50 hover:bg-yellow-100"
                              : "text-gray-300 hover:text-yellow-500 hover:bg-yellow-50"
                          }`}>
                          <Bookmark size={16} className={isSaved ? "fill-yellow-500" : ""} />
                        </button>

                        {/* Applied / Type Badge */}
                        {isApplied ? (
                          <span className="flex items-center gap-1 badge bg-green-100 text-green-700 whitespace-nowrap">
                            <CheckCircle size={11} /> Applied
                          </span>
                        ) : (
                          <span className={`badge capitalize whitespace-nowrap ${
                            job.type === "full_time"  ? "bg-blue-100 text-blue-700"     :
                            job.type === "internship" ? "bg-purple-100 text-purple-700" :
                            "bg-orange-100 text-orange-700"
                          }`}>
                            {job.type.replace("_", " ")}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin size={13} className="flex-shrink-0" /> {job.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-green-600 font-semibold">
                        <DollarSign size={13} className="flex-shrink-0" /> ₹{job.salary} LPA
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar size={13} className="flex-shrink-0" />
                        Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                        {new Date(job.applicationDeadline) - new Date() < 3 * 24 * 60 * 60 * 1000 && (
                          <span className="badge bg-red-100 text-red-600 text-xs ml-1">Closing Soon!</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <TrendingUp size={13} className="flex-shrink-0" /> {job.applicationsCount} applicants
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {job.skills?.slice(0, 3).map(s => (
                        <span key={s} className="badge bg-gray-100 text-gray-600 text-xs">{s}</span>
                      ))}
                      {job.skills?.length > 3 && (
                        <span className="badge bg-gray-100 text-gray-400 text-xs">+{job.skills.length - 3}</span>
                      )}
                    </div>
                  </div>

                  <div className="px-5 pb-5 flex items-center justify-between">
                    <span className="text-xs text-gray-400">Min CGPA: {job.eligibility?.minCGPA}</span>
                    <Link to={`/jobs/${job._id}`}
                      className={`text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors ${
                        isApplied
                          ? "bg-green-50 text-green-700 hover:bg-green-100"
                          : "bg-primary-600 text-white hover:bg-primary-700"
                      }`}>
                      {isApplied ? "View Application" : "View & Apply"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterTag({ label, onRemove }) {
  return (
    <span className="flex items-center gap-1.5 bg-primary-50 text-primary-700 border border-primary-200 px-3 py-1 rounded-full text-xs font-medium">
      {label}
      <button onClick={onRemove} className="hover:text-red-500 transition-colors">
        <X size={12} />
      </button>
    </span>
  );
}