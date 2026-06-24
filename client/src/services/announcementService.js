import api from "./api";

export const announcementService = {
  getAll:  ()   => api.get("/announcements"),
  create:  (data) => api.post("/announcements", data),
  delete:  (id)   => api.delete(`/announcements/${id}`),
};