import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Navbar from "../../components/common/Navbar";
import api from "../../services/api";
import { MapPin, DollarSign, Calendar as CalIcon, X, Briefcase, Clock } from "lucide-react";
import { Link } from "react-router-dom";

// Setup localizer
const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format, parse, startOfWeek, getDay, locales,
});

// Job type colors
const TYPE_COLORS = {
  full_time:   { bg: "#2563eb", light: "#dbeafe", text: "#1d4ed8" },
  internship:  { bg: "#7c3aed", light: "#ede9fe", text: "#6d28d9" },
  ppo:         { bg: "#d97706", light: "#fef3c7", text: "#b45309" },
};

export default function DriveCalendar() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentDate,   setCurrentDate]   = useState(new Date());

  // Fetch all approved open jobs
  const { data, isLoading } = useQuery({
    queryKey: ["calendarJobs"],
    queryFn:  () => api.get("/jobs").then(r => r.data.data),
  });

  const jobs = data?.jobs || [];

  // Convert jobs to calendar events
  const events = jobs
    .filter(job => job.applicationDeadline || job.driveDate)
    .flatMap(job => {
      const evts = [];
      const color = TYPE_COLORS[job.type] || TYPE_COLORS.full_time;

      // Application deadline event
      if (job.applicationDeadline) {
        evts.push({
          id:    `deadline-${job._id}`,
          title: `📋 ${job.company?.companyName} — ${job.title}`,
          start: new Date(job.applicationDeadline),
          end:   new Date(job.applicationDeadline),
          type:  "deadline",
          job,
          color: color.bg,
          allDay: true,
        });
      }

      // Drive date event
      if (job.driveDate) {
        evts.push({
          id:    `drive-${job._id}`,
          title: `🏢 ${job.company?.companyName} Drive`,
          start: new Date(job.driveDate),
          end:   new Date(job.driveDate),
          type:  "drive",
          job,
          color: "#10b981",
          allDay: true,
        });
      }

      return evts;
    });

  // Custom event style
  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor: event.color,
      borderRadius:    "6px",
      border:          "none",
      color:           "white",
      fontSize:        "12px",
      padding:         "2px 6px",
      cursor:          "pointer",
    },
  });

  // Upcoming drives this month
  const now = new Date();
  const upcomingDrives = jobs
    .filter(j => j.driveDate && new Date(j.driveDate) >= now)
    .sort((a, b) => new Date(a.driveDate) - new Date(b.driveDate))
    .slice(0, 5);

  const upcomingDeadlines = jobs
    .filter(j => new Date(j.applicationDeadline) >= now)
    .sort((a, b) => new Date(a.applicationDeadline) - new Date(b.applicationDeadline))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl px-8 py-8 overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
          <div className="relative z-10">
            <p className="text-blue-200 text-sm font-medium mb-2 uppercase tracking-wide">
              CareerSync · Placement Schedule
            </p>
            <h1 className="text-3xl font-bold text-white mb-1">📅 Drive Calendar</h1>
            <p className="text-blue-200">
              Track all upcoming placement drives and application deadlines.
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-sm font-semibold text-gray-700">Legend:</p>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-600" />
              <span className="text-sm text-gray-600">Full Time Deadline</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-violet-600" />
              <span className="text-sm text-gray-600">Internship Deadline</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-600" />
              <span className="text-sm text-gray-600">PPO Deadline</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-500" />
              <span className="text-sm text-gray-600">Drive Day</span>
            </div>
          </div>
        </div>

        {/* Calendar + Sidebar */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-96">
                <p className="text-gray-400">Loading calendar...</p>
              </div>
            ) : (
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                eventPropGetter={eventStyleGetter}
                onSelectEvent={(event) => setSelectedEvent(event)}
                date={currentDate}
                onNavigate={(date) => setCurrentDate(date)}
                views={["month", "week", "agenda"]}
                defaultView="month"
                popup
                tooltipAccessor="title"
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* Upcoming Drives */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Briefcase size={16} className="text-emerald-600" />
                </div>
                <h2 className="font-bold text-gray-900">Upcoming Drives</h2>
              </div>
              {upcomingDrives.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No upcoming drives</p>
              ) : (
                <div className="space-y-3">
                  {upcomingDrives.map(job => (
                    <Link key={job._id} to={`/jobs/${job._id}`}
                      className="block p-3 bg-gray-50 hover:bg-emerald-50 rounded-xl transition-colors group">
                      <p className="font-semibold text-gray-800 text-sm group-hover:text-emerald-700 line-clamp-1">
                        {job.company?.companyName}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-1">{job.title}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <CalIcon size={11} className="text-emerald-500" />
                        <p className="text-xs text-emerald-600 font-medium">
                          {new Date(job.driveDate).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric"
                          })}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Closing Soon */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <Clock size={16} className="text-red-600" />
                </div>
                <h2 className="font-bold text-gray-900">Closing Soon</h2>
              </div>
              {upcomingDeadlines.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No deadlines soon</p>
              ) : (
                <div className="space-y-3">
                  {upcomingDeadlines.map(job => {
                    const daysLeft = Math.ceil(
                      (new Date(job.applicationDeadline) - now) / (1000 * 60 * 60 * 24)
                    );
                    return (
                      <Link key={job._id} to={`/jobs/${job._id}`}
                        className="block p-3 bg-gray-50 hover:bg-red-50 rounded-xl transition-colors group">
                        <p className="font-semibold text-gray-800 text-sm group-hover:text-red-700 line-clamp-1">
                          {job.title}
                        </p>
                        <p className="text-xs text-gray-500">{job.company?.companyName}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-400">
                            {new Date(job.applicationDeadline).toLocaleDateString()}
                          </p>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            daysLeft <= 3
                              ? "bg-red-100 text-red-600"
                              : daysLeft <= 7
                              ? "bg-orange-100 text-orange-600"
                              : "bg-gray-100 text-gray-600"
                          }`}>
                            {daysLeft}d left
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Event Detail Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedEvent(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
              onClick={e => e.stopPropagation()}>

              {/* Modal Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={`badge text-xs font-semibold mb-2 ${
                    selectedEvent.type === "drive"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-blue-100 text-blue-700"
                  }`}>
                    {selectedEvent.type === "drive" ? "🏢 Drive Day" : "📋 Application Deadline"}
                  </span>
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedEvent.job?.title}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {selectedEvent.job?.company?.companyName}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Job Details */}
              <div className="space-y-3 mb-5">
                <div className="flex items-center gap-3 text-sm bg-gray-50 rounded-xl p-3">
                  <CalIcon size={15} className="text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">
                      {selectedEvent.type === "drive" ? "Drive Date" : "Application Deadline"}
                    </p>
                    <p className="font-semibold text-gray-800">
                      {new Date(selectedEvent.start).toLocaleDateString("en-IN", {
                        weekday: "long", day: "numeric", month: "long", year: "numeric"
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm bg-gray-50 rounded-xl p-3">
                  <DollarSign size={15} className="text-green-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Package</p>
                    <p className="font-semibold text-green-600">
                      ₹{selectedEvent.job?.salary} LPA
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm bg-gray-50 rounded-xl p-3">
                  <MapPin size={15} className="text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Location</p>
                    <p className="font-semibold text-gray-800">
                      {selectedEvent.job?.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm bg-gray-50 rounded-xl p-3">
                  <Briefcase size={15} className="text-purple-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Job Type</p>
                    <p className="font-semibold text-gray-800 capitalize">
                      {selectedEvent.job?.type?.replace("_", " ")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Eligibility */}
              <div className="bg-blue-50 rounded-xl p-3 mb-5">
                <p className="text-xs font-semibold text-blue-600 mb-1">Eligibility</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600">
                    Min CGPA: <strong>{selectedEvent.job?.eligibility?.minCGPA}</strong>
                  </span>
                  <span className="text-gray-600">
                    Backlogs: <strong>{selectedEvent.job?.eligibility?.maxBacklogs}</strong>
                  </span>
                </div>
                {selectedEvent.job?.eligibility?.branches?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedEvent.job.eligibility.branches.map(b => (
                      <span key={b} className="badge bg-blue-100 text-blue-700 text-xs">{b}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Link
                  to={`/jobs/${selectedEvent.job?._id}`}
                  className="btn-primary flex-1 text-center py-2.5"
                  onClick={() => setSelectedEvent(null)}>
                  View & Apply
                </Link>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="btn-secondary px-4 py-2.5">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}