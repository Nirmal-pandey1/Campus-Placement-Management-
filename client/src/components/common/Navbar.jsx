import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "../../services/notificationService";
import Avatar from "./Avatar";
import {
  GraduationCap, LogOut, Bell, Check,
  Trash2, X, Menu
} from "lucide-react";
import toast from "react-hot-toast";

const studentLinks = [
  { to: "/", label: "Dashboard" },
  { to: "/jobs", label: "Jobs" },
  { to: "/saved-jobs", label: "Saved Jobs" },
  { to: "/applications", label: "My Applications" },
  { to: "/interviews", label: "Interviews" },
  { to: "/calendar", label: "Calendar" },
  { to: "/announcements", label: "Announcements" },
  { to: "/chat", label: "Messages" },
  { to: "/profile", label: "Profile" },
];
const companyLinks = [
  { to: "/company", label: "Dashboard" },
  { to: "/company/jobs", label: "My Jobs" },
  { to: "/company/post-job", label: "Post Job" },
  { to: "/company/interviews", label: "Interviews" },
  { to: "/chat", label: "Messages" },
];
const adminLinks = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/students", label: "Students" },
  { to: "/admin/companies", label: "Companies" },
  { to: "/admin/jobs", label: "Jobs" },
  { to: "/admin/announcements", label: "Announcements" },
  { to: "/admin/calendar", label: "Calendar" },
  { to: "/admin/reports", label: "Reports" },
  { to: "/chat", label: "Messages" },
];

const TYPE_STYLES = {
  job: { bg: "bg-blue-100", icon: "💼" },
  application: { bg: "bg-purple-100", icon: "📋" },
  interview: { bg: "bg-orange-100", icon: "🗓" },
  system: { bg: "bg-gray-100", icon: "🔔" },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [showNotif, setShowNotif] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const notifRef = useRef(null);

  const links =
    user?.role === "admin" ? adminLinks :
      user?.role === "company" ? companyLinks :
        studentLinks;

  // Fetch notifications
  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationService.getAll().then(r => r.data.data),
    refetchInterval: 30000,
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationService.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries(["notifications"]),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries(["notifications"]),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => notificationService.delete(id),
    onSuccess: () => queryClient.invalidateQueries(["notifications"]),
  });

  // Close notification dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out!");
    navigate("/login");
  };

  const handleNotifClick = (notif) => {
    if (!notif.isRead) markReadMutation.mutate(notif._id);
    if (notif.link) navigate(notif.link);
    setShowNotif(false);
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="bg-primary-600 p-1.5 rounded-lg">
                <GraduationCap className="text-white" size={22} />
              </div>
              <div>
                <span className="font-bold text-gray-900 text-lg">CareerSync</span>
                <p className="text-xs text-gray-400 -mt-0.5 hidden sm:block">
                  Campus Recruitment Platform
                </p>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-1">
              {links.map(({ to, label }) => (
                <Link key={to} to={to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${location.pathname === to
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}>
                  {label}
                </Link>
              ))}
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">

              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotif(!showNotif)}
                  className="relative p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotif && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="badge bg-red-100 text-red-600 text-xs">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={() => markAllReadMutation.mutate()}
                            className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                            <Check size={12} /> Mark all read
                          </button>
                        )}
                        <button onClick={() => setShowNotif(false)}
                          className="text-gray-400 hover:text-gray-600">
                          <X size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="text-center py-10">
                          <Bell size={32} className="mx-auto text-gray-300 mb-2" />
                          <p className="text-sm text-gray-400">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map(notif => {
                          const style = TYPE_STYLES[notif.type] || TYPE_STYLES.system;
                          return (
                            <div key={notif._id}
                              className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.isRead ? "bg-blue-50/50" : ""
                                }`}>
                              <div onClick={() => handleNotifClick(notif)}
                                className={`w-9 h-9 ${style.bg} rounded-xl flex items-center justify-center text-base flex-shrink-0 mt-0.5`}>
                                {style.icon}
                              </div>
                              <div className="flex-1 min-w-0"
                                onClick={() => handleNotifClick(notif)}>
                                <p className={`text-sm text-gray-900 ${!notif.isRead ? "font-bold" : "font-semibold"}`}>
                                  {notif.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                  {notif.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(notif.createdAt).toLocaleDateString()} ·{" "}
                                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </p>
                              </div>
                              <button
                                onClick={e => { e.stopPropagation(); deleteMutation.mutate(notif._id); }}
                                className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 mt-1">
                                <Trash2 size={14} />
                              </button>
                              {!notif.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    {notifications.length > 0 && (
                      <div className="px-4 py-2 border-t border-gray-100 text-center">
                        <p className="text-xs text-gray-400">
                          Showing last {notifications.length} notifications
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User info — desktop only */}
              <div className="hidden xl:flex items-center gap-2">
                <Avatar src={user?.avatar} name={user?.name} size="sm" />
                <div>
                  <p className="text-sm font-medium text-gray-800 leading-none">{user?.name}</p>
                  <p className="text-xs text-primary-600 capitalize mt-0.5">{user?.role}</p>
                </div>
              </div>

              {/* Logout — desktop */}
              <button onClick={handleLogout} title="Logout"
                className="hidden lg:flex items-center gap-1 text-gray-500 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50">
                <LogOut size={18} />
              </button>

              {/* Hamburger — mobile only */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>

            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* Slide-in Panel */}
          <div className="relative ml-auto w-72 bg-white h-full shadow-2xl flex flex-col">

            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="bg-primary-600 p-1.5 rounded-lg">
                  <GraduationCap className="text-white" size={20} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">CareerSync</p>
                  <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                <X size={20} />
              </button>
            </div>

            {/* User Info */}
            <div className="px-4 py-3 bg-primary-50 border-b border-primary-100 flex items-center gap-3">
              <Avatar src={user?.avatar} name={user?.name} size="md" />
              <div>
                <p className="font-semibold text-primary-900">{user?.name}</p>
                <p className="text-xs text-primary-600">{user?.email}</p>
              </div>
            </div>

            {/* Mobile Nav Links */}
            <div className="flex-1 overflow-y-auto py-3">
              {links.map(({ to, label }) => (
                <Link key={to} to={to}
                  className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${location.pathname === to
                    ? "bg-primary-50 text-primary-700 border-r-2 border-primary-600"
                    : "text-gray-700 hover:bg-gray-50"
                    }`}>
                  {label}
                </Link>
              ))}
            </div>

            {/* Logout Button */}
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-xl transition-colors">
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}