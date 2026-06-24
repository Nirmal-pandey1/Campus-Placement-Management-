import { useQuery } from "@tanstack/react-query";
import Navbar from "../../components/common/Navbar";
import { announcementService } from "../../services/announcementService";
import { Megaphone } from "lucide-react";

const PRIORITY_STYLES = {
  high:   { bg: "bg-red-50",    border: "border-red-200",    badge: "bg-red-100 text-red-700",    emoji: "🔴" },
  medium: { bg: "bg-yellow-50", border: "border-yellow-200", badge: "bg-yellow-100 text-yellow-700", emoji: "🟡" },
  low:    { bg: "bg-green-50",  border: "border-green-200",  badge: "bg-green-100 text-green-700",   emoji: "🟢" },
};

export default function Announcements() {
  const { data, isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn:  () => announcementService.getAll().then(r => r.data.data),
  });

  const announcements = data?.announcements || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Megaphone size={20} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
            <p className="text-gray-500 text-sm">
              Stay updated with latest placement news
            </p>
          </div>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-400 py-12">Loading announcements...</p>
        ) : announcements.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
            <Megaphone size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No announcements yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Check back later for updates!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map(ann => {
              const style = PRIORITY_STYLES[ann.priority];
              return (
                <div key={ann._id}
                  className={`rounded-2xl border ${style.bg} ${style.border} p-5 hover:shadow-md transition-shadow`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className={`badge ${style.badge} font-semibold`}>
                      {style.emoji} {ann.priority.toUpperCase()} PRIORITY
                    </span>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date(ann.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{ann.title}</h3>
                  <p className="text-gray-700 leading-relaxed">{ann.message}</p>
                  <p className="text-xs text-gray-400 mt-3">
                    Posted by {ann.postedBy?.name || "Admin"}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}