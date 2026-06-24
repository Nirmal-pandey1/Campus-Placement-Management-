import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/common/Navbar";
import Avatar from "../../components/common/Avatar";
import api from "../../services/api";
import {
  Briefcase, FileText, TrendingUp, Clock,
  Target, Users, BookOpen, Award,
  ChevronLeft, ChevronRight, Zap, Globe, Shield, Star
} from "lucide-react";

const QUOTES = [
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.", author: "Steve Jobs" },
  { text: "Choose a job you love, and you will never have to work a day in your life.", author: "Confucius" },
  { text: "Success is not the key to happiness. Happiness is the key to success. If you love what you are doing, you will be successful.", author: "Albert Schweitzer" },
  { text: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
];

const OBJECTIVES = [
  {
    icon: Target, title: "Bridge the Gap",
    desc: "Connecting talented students directly with top-tier recruiters, eliminating barriers between campus talent and industry opportunity.",
    bg: "bg-blue-50", iconColor: "text-blue-600",
  },
  {
    icon: Globe, title: "Industry Exposure",
    desc: "Providing students access to companies across sectors — IT, Finance, Core Engineering, Consulting — all in one unified platform.",
    bg: "bg-emerald-50", iconColor: "text-emerald-600",
  },
  {
    icon: BookOpen, title: "Streamlined Process",
    desc: "Digitizing the entire placement workflow from job posting and application tracking to interview scheduling and offer management.",
    bg: "bg-violet-50", iconColor: "text-violet-600",
  },
  {
    icon: Shield, title: "Transparency & Fairness",
    desc: "Ensuring every eligible student gets an equal opportunity through verified listings, clear eligibility criteria, and real-time status updates.",
    bg: "bg-orange-50", iconColor: "text-orange-600",
  },
  {
    icon: Users, title: "Empower TPO",
    desc: "Giving Training & Placement Officers powerful admin tools to monitor drives, generate reports, and coordinate between students and companies.",
    bg: "bg-rose-50", iconColor: "text-rose-600",
  },
  {
    icon: Award, title: "Career Growth",
    desc: "Helping students build professional profiles, track placement progress, and secure offers that truly align with their career aspirations.",
    bg: "bg-yellow-50", iconColor: "text-yellow-600",
  },
];

function QuoteCarousel() {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);

  const goTo = (next) => {
    setFade(false);
    setTimeout(() => { setIdx(next); setFade(true); }, 300);
  };

  useEffect(() => {
    const t = setInterval(() => goTo((idx + 1) % QUOTES.length), 6000);
    return () => clearInterval(t);
  }, [idx]);

  const q = QUOTES[idx];

  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-8 md:p-12 overflow-hidden">
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-blue-500/10 rounded-full" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-cyan-500/10 rounded-full" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-6">
          <Star size={16} className="text-yellow-400 fill-yellow-400" />
          <span className="text-yellow-400 text-sm font-semibold tracking-widest uppercase">
            Quote of the Moment
          </span>
        </div>
        <blockquote
          style={{ transition: "opacity 0.3s ease", opacity: fade ? 1 : 0 }}
          className="text-xl md:text-2xl font-light text-white leading-relaxed mb-6 italic">
          "{q.text}"
        </blockquote>
        <p className="text-blue-300 font-semibold text-sm">— {q.author}</p>
        <div className="flex items-center gap-3 mt-8">
          <button
            onClick={() => goTo((idx - 1 + QUOTES.length) % QUOTES.length)}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
            <ChevronLeft size={18} />
          </button>
          <div className="flex gap-1.5">
            {QUOTES.map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${i === idx ? "w-6 h-2 bg-blue-400" : "w-2 h-2 bg-white/30 hover:bg-white/50"
                  }`} />
            ))}
          </div>
          <button
            onClick={() => goTo((idx + 1) % QUOTES.length)}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

export default function StudentDashboard() {
  const { user } = useAuth();

  const { data: appsData } = useQuery({
    queryKey: ["myApplications"],
    queryFn: () => api.get("/applications/my").then(r => r.data.data),
  });
  const { data: jobsData } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => api.get("/jobs").then(r => r.data.data),
  });
  const { data: annData } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => api.get("/announcements").then(r => r.data.data),
  });

  const announcements = annData?.announcements || [];

  const apps = appsData?.applications || [];
  const jobs = jobsData?.jobs || [];

  const stats = [
    { icon: Briefcase, label: "Available Jobs", value: jobs.length, color: "bg-blue-500" },
    { icon: FileText, label: "Applied", value: apps.length, color: "bg-violet-500" },
    { icon: TrendingUp, label: "Shortlisted", value: apps.filter(a => a.status === "shortlisted").length, color: "bg-emerald-500" },
    { icon: Clock, label: "Pending Review", value: apps.filter(a => a.status === "applied").length, color: "bg-orange-500" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">

        {/* Hero */}
        <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-3xl px-8 py-10 overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Zap size={15} className="text-yellow-300" />
                <span className="text-blue-200 text-sm font-medium tracking-wide uppercase">
                  CareerSync · Student Dashboard
                </span>
              </div>
              <div className="flex items-center gap-4 mb-3">
                <Avatar src={user?.avatar} name={user?.name} size="lg" className="border-4 border-white/30" />
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  Welcome back, {user?.name || "Student"}! 👋
                </h1>
              </div>
              <p className="text-blue-200 max-w-lg">
                Your gateway to campus recruitment — explore jobs, track applications,
                and launch your career with CareerSync.
              </p>
            </div>
            <Link to="/jobs"
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow-lg whitespace-nowrap self-start md:self-auto">
              <Briefcase size={18} /> Browse Jobs
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(s => <StatCard key={s.label} {...s} />)}
        </div>

        {/* Quotes */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-1 w-8 rounded-full bg-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Words of Wisdom</h2>
          </div>
          <QuoteCarousel />
        </div>

        {/* Objectives */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-1 w-8 rounded-full bg-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Our Mission & Objectives</h2>
          </div>
          <p className="text-gray-500 mb-7 ml-11 max-w-2xl">
            <span className="font-semibold text-gray-700">
              CareerSync — A Digital Platform For Campus Recruitment
            </span>{" "}
            is built to make campus placement transparent, efficient, and empowering
            for every student, company, and TPO.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {OBJECTIVES.map(({ icon: Icon, title, desc, bg, iconColor }) => (
              <div key={title}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-200 group">
                <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={22} className={iconColor} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Announcements */}
        {announcements.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-1 w-8 rounded-full bg-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">📢 Latest Announcements</h2>
              </div>
              <Link to="/announcements" className="text-sm text-blue-600 hover:underline font-medium">
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {announcements.slice(0, 2).map(ann => (
                <div key={ann._id} className={`rounded-2xl border p-4 ${ann.priority === "high" ? "bg-red-50 border-red-200" :
                  ann.priority === "medium" ? "bg-yellow-50 border-yellow-200" :
                    "bg-green-50 border-green-200"
                  }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`badge text-xs font-semibold mb-1 ${ann.priority === "high" ? "bg-red-100 text-red-700" :
                        ann.priority === "medium" ? "bg-yellow-100 text-yellow-700" :
                          "bg-green-100 text-green-700"
                        }`}>
                        {ann.priority === "high" ? "🔴" : ann.priority === "medium" ? "🟡" : "🟢"} {ann.priority.toUpperCase()}
                      </span>
                      <p className="font-bold text-gray-900">{ann.title}</p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ann.message}</p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(ann.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Jobs + Applications */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Latest Openings</h2>
              <Link to="/jobs" className="text-sm text-blue-600 hover:underline font-medium">
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {jobs.slice(0, 5).map(job => (
                <Link key={job._id} to={`/jobs/${job._id}`}
                  className="flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-sm font-bold text-blue-700 shadow-sm">
                      {job.company?.companyName?.[0] || "?"}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 group-hover:text-blue-700 text-sm">
                        {job.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {job.company?.companyName} · {job.location}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">₹{job.salary} LPA</span>
                </Link>
              ))}
              {jobs.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                  <Briefcase size={36} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No jobs available right now. Check back soon!</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">My Applications</h2>
              <Link to="/applications" className="text-sm text-blue-600 hover:underline font-medium">
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {apps.slice(0, 5).map(app => (
                <div key={app._id} className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm font-semibold text-gray-800">{app.job?.title}</p>
                  <p className="text-xs text-gray-400 mb-2">{app.job?.company?.companyName}</p>
                  <span className={`badge text-xs font-medium capitalize ${app.status === "selected" ? "bg-green-100 text-green-700" :
                    app.status === "rejected" ? "bg-red-100 text-red-600" :
                      app.status === "shortlisted" ? "bg-blue-100 text-blue-700" :
                        app.status === "interview" ? "bg-purple-100 text-purple-700" :
                          "bg-gray-100 text-gray-600"
                    }`}>
                    {app.status}
                  </span>
                </div>
              ))}
              {apps.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <FileText size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No applications yet. Apply to your first job!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-6 border-t border-gray-200">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-gray-600">CareerSync</span>
            {" "}— A Digital Platform For Campus Recruitment. All rights reserved.
          </p>
        </div>

      </div>
    </div>
  );
}