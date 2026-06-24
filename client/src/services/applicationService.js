import api from "./api";

export const applicationService = {
  apply:         (jobId, data) => api.post(`/applications/${jobId}`, data),
  getMyApps:     ()            => api.get("/applications/my"),
  getApplicants: (jobId)       => api.get(`/applications/job/${jobId}`),
  updateStatus:  (id, data)    => api.put(`/applications/${id}/status`, data),
  withdraw:      (id)          => api.put(`/applications/${id}/withdraw`),
};