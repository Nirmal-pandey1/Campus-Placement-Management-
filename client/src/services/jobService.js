import api from "./api";

export const jobService = {
  getAll:        (params) => api.get("/jobs", { params }),
  getById:       (id)     => api.get(`/jobs/${id}`),
  create:        (data)   => api.post("/jobs", data),
  update:        (id, d)  => api.put(`/jobs/${id}`, d),
  delete:        (id)     => api.delete(`/jobs/${id}`),
  getMyJobs:     ()       => api.get("/jobs/company/my-jobs"),
  getSavedJobs:  ()       => api.get("/students/saved-jobs"),
  saveJob:       (jobId)  => api.post(`/students/saved-jobs/${jobId}`),
  unsaveJob:     (jobId)  => api.delete(`/students/saved-jobs/${jobId}`),
};