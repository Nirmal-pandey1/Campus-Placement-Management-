import { useQuery } from "@tanstack/react-query";
import Navbar from "../../components/common/Navbar";
import { interviewService } from "../../services/interviewService";
import { Calendar, Clock, MapPin, Monitor, Building2, CheckCircle, XCircle } from "lucide-react";

const STATUS_STYLES = {
  scheduled:  { bg: "bg-blue-100",   text: "text-blue-700",  label: "Scheduled"  },
  completed:  { bg: "bg-green-100",  text: "text-green-700", label: "Completed"  },
  cancelled:  { bg: "bg-red-100",    text: "text-red-600",   label: "Cancelled"  },
};

export default function Interviews() {
  const { data, isLoading } = useQuery({
    queryKey: ["myInterviews"],
    queryFn:  () => interviewService.getMyInterviews().then(r => r.data.data),
  });

  const interviews = data?.interviews || [];
  const upcoming   = interviews.filter(i => i.status === "scheduled" && new Date(i.date) >= new Date());
  const past       = interviews.filter(i => i.status !== "scheduled" || new Date(i.date) < new Date());

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl px-8 py-8 overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
          <div className="relative z-10">
            <p className="text-blue-200 text-sm font-medium mb-2 uppercase tracking-wide">
              CareerSync · Interview Schedule
            </p>
            <h1 className="text-3xl font-bold text-white mb-1">My Interviews</h1>
            <p className="text-blue-200">Track all your scheduled interviews in one place.</p>
          </div>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-400 py-12">Loading interviews...</p>
        ) : interviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No interviews scheduled yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Keep applying! Interviews will appear here once scheduled.
            </p>
          </div>
        ) : (
          <>
            {/* Upcoming */}
            {upcoming.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-1 w-8 rounded-full bg-blue-600" />
                  <h2 className="text-lg font-bold text-gray-900">
                    Upcoming Interviews
                    <span className="ml-2 text-sm font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      {upcoming.length}
                    </span>
                  </h2>
                </div>
                <div className="space-y-4">
                  {upcoming.map(i => <InterviewCard key={i._id} interview={i} />)}
                </div>
              </div>
            )}

            {/* Past */}
            {past.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-1 w-8 rounded-full bg-gray-400" />
                  <h2 className="text-lg font-bold text-gray-900">Past Interviews</h2>
                </div>
                <div className="space-y-4">
                  {past.map(i => <InterviewCard key={i._id} interview={i} past />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function InterviewCard({ interview: i, past }) {
  const style    = STATUS_STYLES[i.status] || STATUS_STYLES.scheduled;
  const isOnline = i.mode === "online";

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-6 transition-shadow hover:shadow-md ${
      past ? "border-gray-100 opacity-75" : "border-blue-100"
    }`}>
      <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center font-bold text-primary-700 text-lg">
            {i.company?.companyName?.[0] || "?"}
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{i.job?.title}</h3>
            <p className="text-sm text-gray-500">{i.company?.companyName}</p>
          </div>
        </div>
        <span className={`badge font-medium ${style.bg} ${style.text}`}>
          {style.label}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
          <Calendar size={16} className="text-blue-500" />
          <div>
            <p className="text-xs text-gray-400">Date</p>
            <p className="text-sm font-semibold text-gray-800">
              {new Date(i.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
          <Clock size={16} className="text-purple-500" />
          <div>
            <p className="text-xs text-gray-400">Time</p>
            <p className="text-sm font-semibold text-gray-800">{i.time}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
          {isOnline ? <Monitor size={16} className="text-green-500" /> : <Building2 size={16} className="text-orange-500" />}
          <div>
            <p className="text-xs text-gray-400">Mode</p>
            <p className="text-sm font-semibold text-gray-800 capitalize">{i.mode}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
          <CheckCircle size={16} className="text-blue-500" />
          <div>
            <p className="text-xs text-gray-400">Round</p>
            <p className="text-sm font-semibold text-gray-800">{i.round}</p>
          </div>
        </div>
      </div>

      {/* Online Link */}
      {isOnline && i.link && (
        <div className="bg-blue-50 rounded-xl p-3 mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-blue-400 font-medium">Meeting Link</p>
            <p className="text-sm text-blue-700 truncate">{i.link}</p>
          </div>
          <a href={i.link} target="_blank" rel="noreferrer"
            className="btn-primary text-xs py-1.5 px-4 whitespace-nowrap ml-3">
            Join Meeting
          </a>
        </div>
      )}

      {/* Offline Venue */}
      {!isOnline && i.venue && (
        <div className="bg-orange-50 rounded-xl p-3 mb-3 flex items-center gap-2">
          <MapPin size={14} className="text-orange-500" />
          <div>
            <p className="text-xs text-orange-400 font-medium">Venue</p>
            <p className="text-sm text-orange-700">{i.venue}</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      {i.instructions && (
        <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-100">
          <p className="text-xs text-yellow-600 font-medium mb-1">📋 Instructions</p>
          <p className="text-sm text-yellow-800">{i.instructions}</p>
        </div>
      )}
    </div>
  );
}