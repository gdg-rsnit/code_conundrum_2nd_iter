import { NavLink } from "react-router-dom";

const tabs = [
  { to: "/rounds", label: "ROUNDS", icon: "🔄" },
  { to: "/teams", label: "TEAMS", icon: "👥" },
  { to: "/leaderboard", label: "LEADERBOARD", icon: "🏆" },
  { to: "/monitoring", label: "MONITORING", icon: "📊" },
];

export default function Sidebar() {
  return (
    <aside className="md:min-h-0 bg-linear-to-b from-[#0a0a28]/95 to-[#0a1428]/95 border-b-2 md:border-b-0 md:border-r-2 border-cyan-400 p-3 md:p-6 overflow-x-auto md:overflow-y-auto shadow-lg shadow-cyan-400/5">
      {/* Admin Badge */}
      <div className="hidden md:block mb-10 pb-6 border-b border-cyan-400/30">
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-400/10 border border-cyan-400/50">
          <span className="text-lg">👨‍💼</span>
          <span className="text-xs font-bold text-cyan-300">ADMIN</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex md:block gap-2 md:space-y-2 min-w-max md:min-w-0">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `w-auto md:w-full flex items-center gap-2 md:gap-3 px-3 md:px-5 py-2.5 md:py-4 rounded-lg border-2 text-xs md:text-sm font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
                isActive
                  ? "bg-linear-to-r from-cyan-400 to-sky-500 text-black border-cyan-400 shadow-lg shadow-cyan-400/40"
                  : "border-cyan-400/30 text-cyan-400/70 hover:bg-cyan-400/10 hover:border-cyan-400/60 hover:text-cyan-300"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
                {isActive && <span className="ml-auto text-xs">◀</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Quick Stats */}
      <div className="hidden md:block mt-10 pt-6 border-t border-cyan-400/30 space-y-3">
        <div className="text-xs font-bold text-cyan-300 mb-4">📈 QUICK STATS</div>
        
        <div className="p-3 rounded bg-green-400/10 border border-green-400/30">
          <p className="text-xs text-gray-400">Running Rounds</p>
          <p className="text-lg font-black text-green-400">1</p>
        </div>

        <div className="p-3 rounded bg-cyan-400/10 border border-cyan-400/30">
          <p className="text-xs text-gray-400">Active Teams</p>
          <p className="text-lg font-black text-cyan-400">12</p>
        </div>

        <div className="p-3 rounded bg-orange-400/10 border border-orange-400/30">
          <p className="text-xs text-gray-400">Penalties</p>
          <p className="text-lg font-black text-orange-400">8</p>
        </div>
      </div>
    </aside>
  );
}