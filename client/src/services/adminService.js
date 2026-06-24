import api from "./api";

export const adminService = {
  getStats:       ()           => api.get("/admin/stats"),
  getStudents:    ()           => api.get("/admin/students"),
  getCompanies:   ()           => api.get("/admin/companies"),
  getReports:     ()           => api.get("/admin/reports"),
  approveCompany: (id, status) => api.put(`/admin/companies/${id}/approve`, { isApproved: status }),
  approveJob:     (id, status) => api.put(`/admin/jobs/${id}/approve`,      { isApproved: status }),
  deleteUser:     (id)         => api.delete(`/admin/users/${id}`),
};