import { useQuery } from "@tanstack/react-query";
import Navbar from "../../components/common/Navbar";
import { applicationService } from "../../services/applicationService";
import { FileText, Calendar, Building2 } from "lucide-react";

const STATUS_STYLES = {
  applied:     "bg-gray-100 text-gray-600",
  shortlisted: "bg-blue-100 text-blue-700",
  interview:   "bg-purple-100 text-purple-700",
  selected:    "bg-green-100 text-green-700",
  rejected:    "bg-red-100 text-red-600",
  withdrawn:   "bg-yellow-100 text-yellow-700",
};

export default function MyApplications() {
  const { data, isLoading } = useQuery({
    queryKey: ["myApplications"],
    queryFn:  () => applicationService.getMyApps().then(r => r.data.data),
  });

  const applications = data?.applications || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Applications</h1>

        {isLoading ? (
          <p className="text-center text-gray-400 py-12">Loading applications...</p>
        ) : applications.length === 0 ? (
          <div className="card text-center py-16">
            <FileText size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No applications yet</p>
            <p className="text-gray-400 text-sm mt-1">Browse jobs and start applying!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map(app => (
              <div key={app._id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-primary-700">
                      {app.job?.company?.companyName?.[0] || "?"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{app.job?.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                        <Building2 size={13} />
                        {app.job?.company?.companyName}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                        <Calendar size={12} />
                        Applied: {new Date(app.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`badge capitalize font-medium ${STATUS_STYLES[app.status] || "bg-gray-100 text-gray-600"}`}>
                      {app.status}
                    </span>
                    {app.currentRound && (
                      <span className="text-xs text-gray-400">Round: {app.currentRound}</span>
                    )}
                    {app.offeredCTC > 0 && (
                      <span className="text-sm font-bold text-green-600">
                        Offer: ₹{app.offeredCTC} LPA
                      </span>
                    )}
                  </div>
                </div>
                {app.feedback && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                      <span className="font-medium text-gray-700">Feedback: </span>
                      {app.feedback}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}