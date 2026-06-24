import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "../../components/common/Navbar";
import { adminService } from "../../services/adminService";
import toast from "react-hot-toast";
import { Building2, CheckCircle, XCircle, Trash2 } from "lucide-react";

export default function ManageCompanies() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["adminCompanies"],
    queryFn: () => adminService.getCompanies().then(r => r.data.data),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, status }) => adminService.approveCompany(id, status),
    onSuccess: () => {
      toast.success("Company status updated!");
      queryClient.invalidateQueries(["adminCompanies"]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminService.deleteUser(id),
    onSuccess: () => {
      toast.success("Company deleted successfully!");
      queryClient.invalidateQueries(["adminCompanies"]);
    },
  });

  const companies = data?.companies || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Manage Companies
          <span className="ml-2 text-lg font-normal text-gray-400">({companies.length})</span>
        </h1>

        {isLoading ? (
          <p className="text-center text-gray-400 py-12">Loading companies...</p>
        ) : (
          <div className="space-y-4">
            {companies.map(c => (
              <div key={c._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center font-bold text-primary-700 text-lg">
                      {c.companyName?.[0]}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{c.companyName}</p>
                      <p className="text-sm text-gray-500">{c.industry} · {c.location}</p>
                      <p className="text-xs text-gray-400">HR: {c.hrName} · {c.hrEmail}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`badge ${c.user?.isApproved
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                      }`}>
                      {c.user?.isApproved ? "Approved" : "Pending"}
                    </span>

                    {!c.user?.isApproved ? (
                      <button
                        onClick={() => approveMutation.mutate({ id: c.user?._id, status: true })}
                        className="flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-700 font-medium px-3 py-1.5 rounded-lg text-sm transition-colors">
                        <CheckCircle size={15} /> Approve
                      </button>
                    ) : (
                      <button
                        onClick={() => approveMutation.mutate({ id: c.user?._id, status: false })}
                        className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 font-medium px-3 py-1.5 rounded-lg text-sm transition-colors">
                        <XCircle size={15} /> Revoke
                      </button>
                    )}

                    {/* Delete Button */}
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete ${c.companyName}? This cannot be undone!`))
                          deleteMutation.mutate(c.user?._id);
                      }}
                      className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 font-medium px-3 py-1.5 rounded-lg text-sm transition-colors">
                      <Trash2 size={15} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {companies.length === 0 && (
              <div className="card text-center py-16 text-gray-400">
                <Building2 size={40} className="mx-auto mb-2 opacity-30" />
                <p>No companies registered yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}