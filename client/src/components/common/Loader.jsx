export default function Loader({ full = true }) {
  if (full) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Loading CareerSync...</p>
      </div>
    </div>
  );
  return (
    <div className="w-6 h-6 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin" />
  );
}