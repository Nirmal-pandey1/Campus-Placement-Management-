import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import { GraduationCap, Eye, EyeOff, CheckCircle } from "lucide-react";

export default function ResetPassword() {
  const { token }               = useParams();
  const navigate                = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }
    if (password !== confirm) {
      return toast.error("Passwords do not match!");
    }

    setLoading(true);
    try {
      await api.put(`/auth/reset-password/${token}`, { password });
      setDone(true);
      toast.success("Password reset successfully!");
      setTimeout(() => navigate("/login"), 3000);
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="bg-primary-600 p-2 rounded-xl">
            <GraduationCap className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">CareerSync</h1>
            <p className="text-xs text-gray-500">A Digital Platform For Campus Recruitment</p>
          </div>
        </div>

        {!done ? (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Reset Password</h2>
            <p className="text-gray-500 text-sm mb-6">
              Enter your new password below.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input-field pr-10"
                    placeholder="Min 6 characters"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  className={`input-field ${
                    confirm && confirm !== password
                      ? "border-red-400 focus:ring-red-400"
                      : confirm && confirm === password
                      ? "border-green-400 focus:ring-green-400"
                      : ""
                  }`}
                  placeholder="Re-enter new password"
                  required
                />
                {confirm && confirm !== password && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
                {confirm && confirm === password && (
                  <p className="text-xs text-green-600 mt-1">✅ Passwords match</p>
                )}
              </div>

              {/* Password strength */}
              <div>
                <div className="flex gap-1 mt-1">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                      password.length === 0    ? "bg-gray-200" :
                      password.length < 6      ? (i < 1 ? "bg-red-400"    : "bg-gray-200") :
                      password.length < 8      ? (i < 2 ? "bg-yellow-400" : "bg-gray-200") :
                      password.length < 10     ? (i < 3 ? "bg-blue-400"   : "bg-gray-200") :
                      "bg-green-400"
                    }`} />
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {password.length === 0    ? "Enter a password"      :
                   password.length < 6      ? "Too short"             :
                   password.length < 8      ? "Weak — add more chars" :
                   password.length < 10     ? "Good password"         :
                   "Strong password! 💪"}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || password !== confirm || password.length < 6}
                className="btn-primary w-full py-3">
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        ) : (
          /* Success State */
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Password Reset! 🎉
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Your password has been successfully reset.
              Redirecting to login in 3 seconds...
            </p>
            <Link to="/login" className="btn-primary px-8 py-3 inline-block">
              Login Now
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}