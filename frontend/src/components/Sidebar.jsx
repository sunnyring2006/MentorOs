import React from "react";

function Sidebar({ currentTab, setCurrentTab, userProfile }) {
  const menuItems = [
    { id: "Dashboard", label: "Dashboard", icon: "📊" },
    { id: "Planner", label: "Planner", icon: "📅" },
    { id: "Goals", label: "Goals", icon: "🎯" },
    { id: "Flashcards", label: "Recall Deck", icon: "📚" },
    { id: "Chat", label: "AI Mentor", icon: "💬" },
    { id: "Settings", label: "Settings", icon: "⚙️" },
  ];

  const userName = userProfile?.name || "Kimaya";
  const userRole = userProfile?.role || "Developer";

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 h-screen bg-slate-900/50 border-r border-slate-800/80 backdrop-blur-xl flex-col justify-between p-6 sticky top-0 z-30 select-none">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-violet-600 to-indigo-600 text-white p-2.5 rounded-2xl text-xl shadow-lg shadow-violet-600/30 flex items-center justify-center animate-pulse">
              🎯
            </div>
            <div>
              <h1 className="text-lg font-black bg-gradient-to-r from-violet-400 via-indigo-200 to-cyan-400 bg-clip-text text-transparent tracking-tight font-display">
                MentorOS
              </h1>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                Elite Productivity
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
                  currentTab === item.id
                    ? "bg-gradient-to-r from-violet-600/20 to-indigo-600/10 border border-violet-500/30 text-violet-200 shadow-lg shadow-violet-900/5"
                    : "border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-850/50"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* User Mini Widget */}
        <div className="border-t border-slate-800/60 pt-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 p-[2px] shadow-lg shadow-violet-500/10 flex-shrink-0">
            <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center text-white font-black text-sm">
              {userName[0]?.toUpperCase()}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-slate-100 truncate tracking-tight">{userName}</h4>
            <p className="text-[10px] text-slate-500 truncate font-semibold uppercase tracking-wider">{userRole}</p>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-950/80 backdrop-blur-xl border-t border-slate-900 z-40 flex justify-around items-center px-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentTab(item.id)}
            className="flex flex-col items-center justify-center gap-0.5 w-12 h-12 transition-all duration-300 cursor-pointer"
          >
            <span className={`text-lg transition-transform duration-200 ${
              currentTab === item.id ? "scale-110" : "scale-100 opacity-60"
            }`}>
              {item.icon}
            </span>
            <span className={`text-[8px] font-bold uppercase tracking-wider ${
              currentTab === item.id ? "text-violet-400" : "text-slate-500"
            }`}>
              {item.label.split(" ")[0]}
            </span>
          </button>
        ))}
      </nav>
    </>
  );
}

export default Sidebar;
