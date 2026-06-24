import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import { adminService } from "../../services/adminService";
import { Users, Building2, Briefcase, TrendingUp, Zap } from "lucide-react";

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
    </div>
    <p className="text-3xl font-bold text-gray-900">{value ?? "—"}</p>
    {sub && <p className="text-sm text-gray-400 mt-1">{sub}</p>}
  </div>
);

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn:  () => adminService.getStats().then(r => r.data.data),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl px-8 py-10 overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={15} className="text-yellow-300" />
              <span className="text-blue-200 text-sm font-medium tracking-wide uppercase">
                CareerSync · Admin Panel
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">Admin Dashboard</h1>
            <p className="text-blue-200">
              Manage students, companies, and track placement progress.
            </p>
          </div>
        </div>

        {/* Stats */}
        {isLoading ? (
          <p className="text-gray-400">Loading stats...</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users}      label="Total Students"  value={data?.totalStudents}
              sub={`${data?.placedStudents} placed`} color="bg-blue-500" />
            <StatCard icon={TrendingUp} label="Placement Rate"  value={`${data?.placementRate}%`}
              color="bg-green-500" />
            <StatCard icon={Building2}  label="Companies"       value={data?.totalCompanies}
              color="bg-purple-500" />
            <StatCard icon={Briefcase}  label="Active Jobs"     value={data?.totalJobs}
              color="bg-orange-500" />
          </div>
        )}

        {/* Quick Actions + Overview */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              {[
                { label: "Manage Students",   href: "/admin/students"  },
                { label: "Manage Companies",  href: "/admin/companies" },
                { label: "Manage Jobs",       href: "/admin/jobs"      },
                { label: "Placement Reports", href: "/admin/reports"   },
              ].map(({ label, href }) => (
                <Link key={href} to={href}
                  className="flex items-center justify-between p-3 bg-gray-50 hover:bg-primary-50 rounded-xl transition-colors group">
                  <span className="text-sm font-medium text-gray-700 group-hover:text-primary-700">
                    {label}
                  </span>
                  <span className="text-primary-500">→</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Platform Overview</h2>
            <div className="space-y-3">
              {[
                { label: "Total Applications", value: data?.totalApplications, color: "text-gray-900" },
                { label: "Placed Students",    value: data?.placedStudents,    color: "text-green-600" },
                { label: "Placement Rate",     value: `${data?.placementRate}%`, color: "text-blue-600" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className={`font-bold ${color}`}>{value ?? "—"}</span>
                </div>
              ))}
            </div>
          </div>
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