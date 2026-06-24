import api from "./api";

export const interviewService = {
  schedule:         (data) => api.post("/interviews", data),
  getMyInterviews:  ()     => api.get("/interviews/my"),
  getCompanyOnes:   ()     => api.get("/interviews/company"),
  update:           (id, data) => api.put(`/interviews/${id}`, data),
  cancel:           (id)   => api.delete(`/interviews/${id}`),
};