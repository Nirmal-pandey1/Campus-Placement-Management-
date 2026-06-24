import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Navbar from "../../components/common/Navbar";
import api from "../../services/api";
import { X, MapPin, DollarSign, Calendar as CalIcon, Users } from "lucide-react";

const locales    = { "en-US": enUS };
const localizer  = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const TYPE_COLORS = {
  full_time:  "#2563eb",
  internship: "#7c3aed",
  ppo:        "#d97706",
};

export default function AdminDriveCalendar() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentDate,   setCurrentDate]   = useState(new Date());

  const { data, isLoading } = useQuery({
    queryKey: ["adminCalendarJobs"],
    queryFn:  () => api.get("/admin/all-jobs").then(r => r.data.data),
  });

  const jobs = data?.jobs || [];

  const events = jobs.flatMap(job => {
    const evts  = [];
    const color = TYPE_COLORS[job.type] || "#2563eb";

    if (job.applicationDeadline) {
      evts.push({
        id:    `deadline-${job._id}`,
        title: `📋 ${job.company?.companyName} — ${job.title}`,
        start: new Date(job.applicationDeadline),
        end:   new Date(job.applicationDeadline),
        type:  "deadline",
        job,   color,
        allDay: true,
      });
    }
    if (job.driveDate) {
      evts.push({
        id:    `drive-${job._id}`,
        title: `🏢 ${job.company?.companyName} Drive`,
        start: new Date(job.driveDate),
        end:   new Date(job.driveDate),
        type:  "drive",
        job,   color: "#10b981",
        allDay: true,
      });
    }
    return evts;
  });

  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor: event.color,
      borderRadius: "6px",
      border: "none",
      color: "white",
      fontSize: "12px",
      padding: "2px 6px",
    },
  });

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
              CareerSync · Admin
            </p>
            <h1 className="text-3xl font-bold text-white mb-1">📅 Drive Calendar</h1>
            <p className="text-blue-200">All placement drives and deadlines at a glance.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Jobs",    value: jobs.length,                                    color: "bg-blue-500"   },
            { label: "With Drive Date", value: jobs.filter(j => j.driveDate).length,         color: "bg-emerald-500"},
            { label: "Closing This Week", value: jobs.filter(j => {
                const diff = new Date(j.applicationDeadline) - new Date();
                return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
              }).length, color: "bg-orange-500" },
            { label: "Open Jobs",     value: jobs.filter(j => j.status === "open").length,   color: "bg-purple-500" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-white font-bold text-lg`}>
                {value}
              </div>
              <p className="text-sm font-medium text-gray-600">{label}</p>
            </div>
          ))}
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
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
              style={{ height: 600 }}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={setSelectedEvent}
              date={currentDate}
              onNavigate={setCurrentDate}
              views={["month", "week", "agenda"]}
              defaultView="month"
              popup
            />
          )}
        </div>

        {/* Event Detail Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedEvent(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={`badge text-xs font-semibold mb-2 ${
                    selectedEvent.type === "drive"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-blue-100 text-blue-700"
                  }`}>
                    {selectedEvent.type === "drive" ? "🏢 Drive Day" : "📋 Deadline"}
                  </span>
                  <h2 className="text-xl font-bold text-gray-900">{selectedEvent.job?.title}</h2>
                  <p className="text-gray-500 text-sm">{selectedEvent.job?.company?.companyName}</p>
                </div>
                <button onClick={() => setSelectedEvent(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3 text-sm bg-gray-50 rounded-xl p-3">
                  <CalIcon size={15} className="text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-400">Date</p>
                    <p className="font-semibold text-gray-800">
                      {new Date(selectedEvent.start).toLocaleDateString("en-IN", {
                        weekday: "long", day: "numeric", month: "long", year: "numeric"
                      })}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">Salary</p>
                    <p className="font-semibold text-green-600">₹{selectedEvent.job?.salary} LPA</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">Applicants</p>
                    <p className="font-semibold text-gray-800">{selectedEvent.job?.applicationsCount}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">Location</p>
                    <p className="font-semibold text-gray-800">{selectedEvent.job?.location}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400">Status</p>
                    <p className={`font-semibold capitalize ${
                      selectedEvent.job?.isApproved ? "text-green-600" : "text-yellow-600"
                    }`}>
                      {selectedEvent.job?.isApproved ? "Approved" : "Pending"}
                    </p>
                  </div>
                </div>
              </div>

              <button onClick={() => setSelectedEvent(null)}
                className="btn-secondary w-full py-2.5">
                Close
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}