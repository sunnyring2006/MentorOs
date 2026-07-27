import React from "react";

function TaskCard({
  title,
  status,
  completed,
  priority = "Medium",
  category = "General",
  onToggle,
  onDelete,
}) {
  // Priority badge styling
  const getPriorityStyle = () => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-rose-500/10 border-rose-500/30 text-rose-400";
      case "medium":
        return "bg-amber-500/10 border-amber-500/30 text-amber-400";
      case "low":
        return "bg-cyan-500/10 border-cyan-500/30 text-cyan-400";
      default:
        return "bg-slate-500/10 border-slate-500/30 text-slate-400";
    }
  };

  // Category badge styling
  const getCategoryStyle = () => {
    switch (category.toLowerCase()) {
      case "work":
        return "bg-violet-500/10 border-violet-500/20 text-violet-300";
      case "study":
        return "bg-indigo-500/10 border-indigo-500/20 text-indigo-300";
      case "personal":
        return "bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-300";
      case "coding":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-300";
      default:
        return "bg-slate-700/30 border-slate-700/50 text-slate-300";
    }
  };

  return (
    <div className={`group flex justify-between items-center bg-slate-900/40 backdrop-blur-md border ${
      completed ? "border-slate-800/40 opacity-60" : "border-slate-800 hover:border-slate-700/80"
    } p-4 rounded-2xl shadow-xl hover:shadow-2xl hover:translate-y-[-1px] transition-all duration-300 relative overflow-hidden`}>
      
      {/* Visual left bar indicating priority */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${
        priority.toLowerCase() === "high" ? "bg-rose-500" :
        priority.toLowerCase() === "low" ? "bg-cyan-400" :
        "bg-amber-500"
      }`}></div>

      <div className="flex items-center gap-4 pl-1">
        {/* Custom Checkbox */}
        <label className="relative flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={completed}
            onChange={onToggle}
            className="sr-only peer"
          />
          <div className="w-5.5 h-5.5 border-2 border-slate-700 rounded-lg bg-slate-950 peer-checked:bg-gradient-to-tr peer-checked:from-violet-600 peer-checked:to-indigo-600 peer-checked:border-transparent flex items-center justify-center transition-all duration-200 shadow-inner group-hover:border-slate-500">
            <svg className={`w-3.5 h-3.5 text-white ${completed ? "block" : "hidden"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </label>

        <div>
          <h3 className={`font-semibold tracking-tight text-slate-100 transition-all duration-200 ${
            completed ? "line-through text-slate-500 font-normal" : "text-slate-200"
          }`}>
            {title}
          </h3>
          <div className="flex items-center flex-wrap gap-2 mt-1.5">
            {/* Category tag */}
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border ${getCategoryStyle()}`}>
              {category}
            </span>
            {/* Priority tag */}
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border ${getPriorityStyle()}`}>
              {priority}
            </span>
            {/* Status tag */}
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border ${
              completed 
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                : "bg-slate-800 text-slate-400 border-slate-700/60"
            }`}>
              {status}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={onDelete}
        className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 border border-transparent transition-all duration-300 cursor-pointer"
        title="Delete task"
      >
        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}

export default TaskCard;