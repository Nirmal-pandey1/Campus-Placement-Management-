import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import Avatar from "./Avatar";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function AvatarUpload({ user, role, onUpdate }) {
  const fileRef  = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const endpoint = role === "company"
        ? "/companies/avatar"
        : "/students/avatar";

      const res = await api.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onUpdate(res.data.data.avatar);
      toast.success("Profile photo updated!");
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <Avatar
        src={user?.avatar}
        name={user?.name}
        size="xl"
      />

      {/* Upload overlay */}
      <button
        onClick={() => fileRef.current?.click()}
        disabled={loading}
        className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Camera size={20} className="text-white" />
        )}
      </button>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={handleUpload}
      />

      {/* Camera badge */}
      <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center border-2 border-white shadow cursor-pointer"
        onClick={() => fileRef.current?.click()}>
        <Camera size={13} className="text-white" />
      </div>
    </div>
  );
}