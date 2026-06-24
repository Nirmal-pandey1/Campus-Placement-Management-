import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "../../components/common/Navbar";
import { interviewService } from "../../services/interviewService";
import toast from "react-hot-toast";
import { Calendar, Clock, Monitor, Building2, XCircle } from "lucide-react";

export default function CompanyInterviews() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["companyInterviews"],
    queryFn:  () => interviewService.getCompanyOnes().then(r => r.data.data),
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => interviewService.cancel(id),
    onSuccess:  () => {
      toast.success("Interview cancelled!");
      queryClient.invalidateQueries(["companyInterviews"]);
    },
  });

  const interviews = data?.interviews || [];
  const upcoming   = interviews.filter(i => i.status === "scheduled" && new Date(i.date) >= new Date());
  const past       = interviews.filter(i => i.status !== "scheduled" || new Date(i.date) < new Date());

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">Scheduled Interviews</h1>

        {isLoading ? (
          <p className="text-center text-gray-400 py-12">Loading interviews...</p>
        ) : interviews.length === 0 ? (
          <div className="card text-center py-16">
            <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No interviews scheduled yet</p>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-1 w-8 rounded-full bg-blue-600" />
                  <h2 className="text-lg font-bold text-gray-900">
                    Upcoming ({upcoming.length})
                  </h2>
                </div>
                <div className="space-y-4">
                  {upcoming.map(i => (
                    <div key={i._id} className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5">
                      <div className="flex items-start justify-between flex-wrap gap-3">
                        <div>
                          <p className="font-bold text-gray-900">
                            {i.student?.user?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {i.student?.user?.email}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {i.job?.title} · {i.round}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                            <Calendar size={13} />
                            {new Date(i.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                            <Clock size={13} /> {i.time}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg capitalize">
                            {i.mode === "online"
                              ? <><Monitor size={13} /> Online</>
                              : <><Building2 size={13} /> Offline</>
                            }
                          </div>
                          <button
                            onClick={() => {
                              if (window.confirm("Cancel this interview?"))
                                cancelMutation.mutate(i._id);
                            }}
                            className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                            <XCircle size={14} /> Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {past.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-1 w-8 rounded-full bg-gray-400" />
                  <h2 className="text-lg font-bold text-gray-900">Past ({past.length})</h2>
                </div>
                <div className="space-y-3">
                  {past.map(i => (
                    <div key={i._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 opacity-70">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <p className="font-semibold text-gray-800">{i.student?.user?.name}</p>
                          <p className="text-xs text-gray-400">{i.job?.title} · {i.round}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">
                            {new Date(i.date).toLocaleDateString()} at {i.time}
                          </span>
                          <span className={`badge capitalize text-xs ${
                            i.status === "completed" ? "bg-green-100 text-green-700" :
                            i.status === "cancelled" ? "bg-red-100 text-red-600"     :
                            "bg-gray-100 text-gray-600"
                          }`}>
                            {i.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}