import React from "react";

function Navbar({ currentTab, onOpenSettings, isKeyConfigured }) {
  const getTabTitle = () => {
    switch (currentTab) {
      case "Dashboard": return "Dashboard Summary";
      case "Planner": return "Adaptive Day Planner";
      case "Goals": return "Targets & Milestones";
      case "Flashcards": return "Spaced Recall Deck";
      case "Chat": return "Consult AI Mentor";
      case "Settings": return "System Settings";
      default: return "MentorOS Hub";
    }
  };

  return (
    <nav className="flex justify-between items-center bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 px-6 py-4 rounded-3xl shadow-2xl mb-8 relative overflow-hidden select-none">
      {/* Decorative top accent line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-violet-500/40 to-transparent"></div>
      
      <div className="flex items-center gap-3">
        <div className="lg:hidden bg-gradient-to-tr from-violet-600 to-indigo-600 text-white p-2 rounded-xl text-md flex items-center justify-center">
          🎯
        </div>
        <div>
          <h1 className="text-base lg:text-lg font-black text-slate-100 tracking-tight font-display">
            {getTabTitle()}
          </h1>
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider hidden sm:block">
            MentorOS Productivity Companion
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Key status indicator */}
        <div 
          onClick={onOpenSettings}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer hover:scale-[1.02] transition-all duration-300 ${
            isKeyConfigured 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : "bg-amber-500/10 border-amber-500/20 text-amber-400"
          }`}
          title={isKeyConfigured ? "Gemini Key Configured" : "Gemini Key Missing"}
        >
          <span className="flex h-2 w-2 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isKeyConfigured ? "bg-emerald-400" : "bg-amber-400"
            }`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              isKeyConfigured ? "bg-emerald-500" : "bg-amber-500"
            }`}></span>
          </span>
          <span className="text-[9px] font-extrabold uppercase tracking-wider">
            {isKeyConfigured ? "AI Synced" : "Setup AI"}
          </span>
        </div>

        {/* Quick Settings Icon */}
        <button
          onClick={onOpenSettings}
          className="p-2.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-slate-350 hover:text-white hover:bg-slate-750 transition-all duration-300 shadow-md group cursor-pointer"
          title="Go to settings"
        >
          <svg 
            className="w-4.5 h-4.5 transform group-hover:rotate-45 transition-transform duration-300" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;