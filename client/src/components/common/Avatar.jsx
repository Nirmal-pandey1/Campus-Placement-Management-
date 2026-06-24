export default function Avatar({ src, name, size = "md", className = "" }) {
  const sizes = {
    xs:  "w-7 h-7 text-xs",
    sm:  "w-9 h-9 text-sm",
    md:  "w-11 h-11 text-sm",
    lg:  "w-16 h-16 text-xl",
    xl:  "w-24 h-24 text-3xl",
  };

  const initials = name
    ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  if (src) {
    return (
      <img
        src={src}
        alt={name || "Avatar"}
        className={`${sizes[size]} rounded-full object-cover border-2 border-white shadow-sm ${className}`}
        onError={(e) => { e.target.style.display = "none"; }}
      />
    );
  }

  // Color based on name
  const colors = [
    "bg-blue-500", "bg-purple-500", "bg-green-500",
    "bg-orange-500", "bg-rose-500", "bg-cyan-500",
    "bg-indigo-500", "bg-amber-500",
  ];
  const colorIndex = name
    ? name.charCodeAt(0) % colors.length
    : 0;

  return (
    <div className={`${sizes[size]} ${colors[colorIndex]} rounded-full flex items-center justify-center font-bold text-white border-2 border-white shadow-sm ${className}`}>
      {initials}
    </div>
  );
}