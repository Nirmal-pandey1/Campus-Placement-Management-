import Interviews from "./pages/student/Interviews";
import ScheduleInterview from "./pages/company/ScheduleInterview";
import CompanyInterviews from "./pages/company/CompanyInterviews";

import Announcements        from "./pages/student/Announcements";
import AdminAnnouncements   from "./pages/admin/Announcements";

import DriveCalendar      from "./pages/student/DriveCalendar";
import AdminDriveCalendar from "./pages/admin/DriveCalendar";

import SavedJobs from "./pages/student/SavedJobs";

import Chat from "./pages/Chat";

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProfile from "./pages/student/StudentProfile";
import JobListings from "./pages/student/JobListings";
import JobDetail from "./pages/student/JobDetail";
import MyApplications from "./pages/student/MyApplications";

import CompanyDashboard from "./pages/company/CompanyDashboard";
import PostJob from "./pages/company/PostJob";
import ManageJobs from "./pages/company/ManageJobs";
import Applicants from "./pages/company/Applicants";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageStudents from "./pages/admin/ManageStudents";
import ManageCompanies from "./pages/admin/ManageCompanies";
import PlacementReports from "./pages/admin/PlacementReports";
import ManageJobsAdmin from "./pages/admin/ManageJobsAdmin";

import Loader from "./components/common/Loader";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
      <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/" />} />
      <Route path="/reset-password/:token" element={!user ? <ResetPassword /> : <Navigate to="/" />} />

      {/* Student */}
      <Route path="/" element={<ProtectedRoute allowedRoles={["student"]}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute allowedRoles={["student"]}><StudentProfile /></ProtectedRoute>} />
      <Route path="/jobs" element={<ProtectedRoute allowedRoles={["student"]}><JobListings /></ProtectedRoute>} />
      <Route path="/jobs/:id" element={<ProtectedRoute allowedRoles={["student"]}><JobDetail /></ProtectedRoute>} />
      <Route path="/applications" element={<ProtectedRoute allowedRoles={["student"]}><MyApplications /></ProtectedRoute>} />
      <Route path="/interviews" element={<ProtectedRoute allowedRoles={["student"]}><Interviews /></ProtectedRoute>} />
      <Route path="/announcements" element={<ProtectedRoute allowedRoles={["student", "company"]}><Announcements /></ProtectedRoute>} />
      <Route path="/saved-jobs" element={<ProtectedRoute allowedRoles={["student"]}><SavedJobs /></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute allowedRoles={["student"]}><DriveCalendar /></ProtectedRoute>} />

      {/* Company */}
      <Route path="/company" element={<ProtectedRoute allowedRoles={["company"]}><CompanyDashboard /></ProtectedRoute>} />
      <Route path="/company/post-job" element={<ProtectedRoute allowedRoles={["company"]}><PostJob /></ProtectedRoute>} />
      <Route path="/company/jobs" element={<ProtectedRoute allowedRoles={["company"]}><ManageJobs /></ProtectedRoute>} />
      <Route path="/company/jobs/:id/applicants" element={<ProtectedRoute allowedRoles={["company"]}><Applicants /></ProtectedRoute>} />
      <Route path="/company/interviews" element={<ProtectedRoute allowedRoles={["company"]}><CompanyInterviews /></ProtectedRoute>} />
      <Route path="/company/schedule-interview" element={<ProtectedRoute allowedRoles={["company"]}><ScheduleInterview /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute allowedRoles={["admin"]}><ManageStudents /></ProtectedRoute>} />
      <Route path="/admin/companies" element={<ProtectedRoute allowedRoles={["admin"]}><ManageCompanies /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={["admin"]}><PlacementReports /></ProtectedRoute>} />
      <Route path="/admin/jobs" element={<ProtectedRoute allowedRoles={["admin"]}><ManageJobsAdmin /></ProtectedRoute>} />
      <Route path="/admin/announcements" element={<ProtectedRoute allowedRoles={["admin"]}><AdminAnnouncements /></ProtectedRoute>} />
      <Route path="/admin/calendar" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDriveCalendar /></ProtectedRoute>} />

      <Route path="/chat" element={<ProtectedRoute allowedRoles={["student", "company", "admin"]}><Chat /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const App = () => <AppRoutes />;

export default App;