import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import { GraduationCap, Mail, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
      toast.success("Reset link sent to your email!");
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

        {!sent ? (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Forgot Password?</h2>
            <p className="text-gray-500 text-sm mb-6">
              Enter your registered email and we'll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input-field pl-9"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3">
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        ) : (
          /* Success State */
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail size={28} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Check your email!</h2>
            <p className="text-gray-500 text-sm mb-2">
              We sent a password reset link to:
            </p>
            <p className="font-semibold text-primary-600 mb-6">{email}</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-left mb-6">
              <p className="text-sm text-yellow-800">
                ⚠️ The link expires in <strong>30 minutes</strong>.
                Check your spam folder if you don't see it.
              </p>
            </div>
            <button
              onClick={() => setSent(false)}
              className="btn-secondary w-full py-2.5">
              Try a different email
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors">
            <ArrowLeft size={15} /> Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
}