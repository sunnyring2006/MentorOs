import React from "react";

function StatsCard({ title, value }) {
  // Map title to icon
  const getIcon = () => {
    switch (title.toLowerCase()) {
      case "productivity":
        return (
          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case "tasks":
        return (
          <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      case "focus time":
        return (
          <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "streak":
        return (
          <svg className="w-5 h-5 text-rose-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getGlowColor = () => {
    switch (title.toLowerCase()) {
      case "productivity": return "bg-emerald-500/10 border-emerald-500/20";
      case "tasks": return "bg-violet-500/10 border-violet-500/20";
      case "focus time": return "bg-amber-500/10 border-amber-500/20";
      case "streak": return "bg-rose-500/10 border-rose-500/20";
      default: return "bg-slate-500/10 border-slate-500/20";
    }
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-5 shadow-2xl hover:shadow-violet-600/5 hover:border-slate-700/80 hover:translate-y-[-2px] transition-all duration-300 flex items-center justify-between group relative overflow-hidden">
      {/* Dynamic top gradient line based on card type */}
      <div className={`absolute top-0 left-0 w-full h-[2px] opacity-60 bg-gradient-to-r ${
        title.toLowerCase() === "productivity" ? "from-emerald-500 to-teal-500" :
        title.toLowerCase() === "tasks" ? "from-violet-500 to-fuchsia-500" :
        title.toLowerCase() === "focus time" ? "from-amber-500 to-orange-500" :
        "from-rose-500 to-pink-500"
      }`}></div>

      <div className="flex-1">
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider font-display">
          {title}
        </h3>
        <p className="text-2xl font-black text-slate-100 mt-1.5 tracking-tight font-display" style={{ marginBottom: 0 }}>
          {value}
        </p>
      </div>
      <div className={`p-3 rounded-2xl border ${getGlowColor()} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        {getIcon()}
      </div>
    </div>
  );
}

export default StatsCard;