import { useQuery } from "@tanstack/react-query";
import Navbar from "../../components/common/Navbar";
import { adminService } from "../../services/adminService";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area,
} from "recharts";
import { TrendingUp, Users, Award, DollarSign, Building2, Briefcase } from "lucide-react";

// Chart colors
const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#84cc16"];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3">
        <p className="text-sm font-semibold text-gray-800 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-xs" style={{ color: p.color }}>
            {p.name}: <span className="font-bold">{p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Stat Card
const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
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

export default function PlacementReports() {
  const { data, isLoading } = useQuery({
    queryKey: ["placementReports"],
    queryFn: () => adminService.getReports().then(r => r.data.data),
  });

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400">Loading reports...</p>
      </div>
    </div>
  );

  const {
    branchWise = [],
    topCTC = [],
    ctcDistribution = [],
    companyWise = [],
    monthWise = [],
    jobTypeWise = [],
    overview = {},
  } = data || {};

  // Format data for charts
  const branchChartData = branchWise.map(b => ({
    branch: b._id,
    total: b.total,
    placed: b.placed,
    avgCTC: parseFloat((b.avgCTC || 0).toFixed(2)),
    rate: b.total ? parseFloat(((b.placed / b.total) * 100).toFixed(1)) : 0,
  }));

  const ctcChartData = ctcDistribution.map(c => ({
    range: c._id === 0 ? "0-5 LPA" :
      c._id === 5 ? "5-10 LPA" :
        c._id === 10 ? "10-15 LPA" :
          c._id === 15 ? "15-20 LPA" :
            c._id === 20 ? "20-30 LPA" : "30+ LPA",
    count: c.count,
  }));

  const monthChartData = monthWise.map(m => ({
    month: MONTHS[m._id.month - 1],
    applications: m.applications,
    selected: m.selected,
  }));

  const jobTypeData = jobTypeWise.map(j => ({
    name: j._id === "full_time" ? "Full Time" : j._id === "internship" ? "Internship" : "PPO",
    value: j.count,
  }));

  const placementPieData = [
    { name: "Placed", value: parseInt(overview.placedStudents) || 0 },
    { name: "Not Placed", value: (parseInt(overview.totalStudents) - parseInt(overview.placedStudents)) || 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl px-8 py-8 overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
          <div className="relative z-10">
            <p className="text-blue-200 text-sm font-medium mb-2 uppercase tracking-wide">
              CareerSync · Analytics
            </p>
            <h1 className="text-3xl font-bold text-white mb-1">Placement Reports</h1>
            <p className="text-blue-200">Comprehensive placement analytics and insights</p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard icon={Users} label="Total Students" value={overview.totalStudents} color="bg-blue-500" />
          <StatCard icon={TrendingUp} label="Placed" value={overview.placedStudents} color="bg-green-500" />
          <StatCard icon={Award} label="Placement Rate" value={`${overview.placementRate}%`} color="bg-purple-500" />
          <StatCard icon={DollarSign} label="Avg CTC" value={`₹${overview.avgCTC} LPA`} color="bg-orange-500" />
          <StatCard icon={DollarSign} label="Highest CTC" value={`₹${overview.maxCTC} LPA`} color="bg-rose-500" />
        </div>

        {/* Row 1 — Placement Pie + Job Type Pie */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Placement Rate Pie */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Overall Placement Rate</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={placementPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value">
                  <Cell fill="#2563eb" />
                  <Cell fill="#e2e8f0" />
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center -mt-4">
              <p className="text-4xl font-bold text-blue-600">{overview.placementRate}%</p>
              <p className="text-sm text-gray-400">Placement Rate</p>
            </div>
          </div>

          {/* Job Type Distribution Pie */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Job Type Distribution</h2>
            {jobTypeData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400">
                <p className="text-sm">No data available yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={jobTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {jobTypeData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Row 2 — Branch-wise Bar Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Branch-wise Placement</h2>
          {branchChartData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400">
              <p className="text-sm">No data available yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={branchChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="branch" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="total" name="Total Students" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                <Bar dataKey="placed" name="Placed" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Row 3 — Branch Avg CTC + CTC Distribution */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Branch Avg CTC */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Branch-wise Avg CTC (LPA)</h2>
            {branchChartData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400">
                <p className="text-sm">No data available yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={branchChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="branch" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="avgCTC" name="Avg CTC (LPA)" radius={[4, 4, 0, 0]}>
                    {branchChartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* CTC Distribution */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">CTC Distribution</h2>
            {ctcChartData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400">
                <p className="text-sm">No data available yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={ctcChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Students" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Row 4 — Month-wise Applications Trend */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Monthly Applications Trend</h2>
          {monthChartData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400">
              <p className="text-sm">No data available yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="appGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="selGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area type="monotone" dataKey="applications" name="Applications"
                  stroke="#2563eb" fill="url(#appGradient)" strokeWidth={2} />
                <Area type="monotone" dataKey="selected" name="Selected"
                  stroke="#10b981" fill="url(#selGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Row 5 — Company-wise Hiring */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <Building2 size={20} className="text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Top Hiring Companies</h2>
          </div>
          {companyWise.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400">
              <p className="text-sm">No placement data available yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={companyWise} layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="companyName" tick={{ fontSize: 12 }} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="hired" name="Students Hired" fill="#2563eb" radius={[0, 4, 4, 0]}>
                  {companyWise.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Row 6 — Branch Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Branch-wise Summary</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-max">
              <thead className="bg-gray-50">
                <tr>
                  {["Branch", "Total", "Placed", "Placement %", "Avg CTC (LPA)"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {branchChartData.map(row => (
                  <tr key={row.branch} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-semibold text-gray-800">{row.branch}</td>
                    <td className="px-5 py-3 text-gray-600">{row.total}</td>
                    <td className="px-5 py-3 text-green-600 font-medium">{row.placed}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-20">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${row.rate}%` }}
                          />
                        </div>
                        <span className="font-bold text-blue-600">{row.rate}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-700">₹{row.avgCTC}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top CTC Students */}
        {topCTC.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp size={20} className="text-green-600" />
              <h2 className="text-lg font-bold text-gray-900">Top CTC Students</h2>
            </div>
            <div className="space-y-3">
              {topCTC.map((s, i) => (
                <div key={s._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-yellow-400 text-white" :
                      i === 1 ? "bg-gray-400 text-white" :
                        i === 2 ? "bg-orange-400 text-white" :
                          "bg-gray-100 text-gray-600"
                      }`}>
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-800">{s.user?.name}</p>
                      <p className="text-xs text-gray-400">
                        {s.branch} · {s.placedCompany?.companyName}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-green-600 text-lg">₹{s.ctc} LPA</span>
                </div>
              ))}
            </div>
          </div>
        )}

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