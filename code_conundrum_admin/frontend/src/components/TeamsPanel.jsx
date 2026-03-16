import { useState } from "react";

const mockTeams = [
  { id: 1, name: "CodeMasters", members: 2, score: 450, status: "ACTIVE", penaltyCount: 0 },
  { id: 2, name: "BugHunters", members: 2, score: 380, status: "ACTIVE", penaltyCount: 2 },
  { id: 3, name: "SyntaxError", members: 2, score: 320, status: "BANNED", penaltyCount: 5 },
  { id: 4, name: "Algorithm99", members: 2, score: 410, status: "ACTIVE", penaltyCount: 1 },
];

export default function TeamsPanel() {
  const [filterStatus, setFilterStatus] = useState("ALL");

  const stats = [
    { label: "ACTIVE TEAMS", value: 12, color: "green", icon: "👥" },
    { label: "PENALIZED", value: 8, color: "orange", icon: "⚠️" },
    { label: "BANNED", value: 3, color: "red", icon: "🚫" }
  ];

  const filteredTeams = filterStatus === "ALL" 
    ? mockTeams 
    : mockTeams.filter(t => t.status === filterStatus);

  const getStatusStyle = (status) => {
    const styles = {
      ACTIVE: { bg: "bg-green-400/10", border: "border-green-400/50", text: "text-green-300", badge: "🟢" },
      BANNED: { bg: "bg-red-400/10", border: "border-red-400/50", text: "text-red-300", badge: "🔴" }
    };
    return styles[status];
  };

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(200px,1fr))] mb-8">
        {stats.map((stat, idx) => {
          const colorClass = {
            green: "from-green-400/10 to-green-400/5 border-green-400/50 shadow-green-400/20",
            orange: "from-orange-400/10 to-orange-400/5 border-orange-400/50 shadow-orange-400/20",
            red: "from-red-400/10 to-red-400/5 border-red-400/50 shadow-red-400/20"
          }[stat.color];

          return (
            <div key={idx} className={`panel bg-linear-to-br ${colorClass} border-2 hover:shadow-lg transition-all`}>
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-4xl font-black mb-2">{stat.value}</div>
              <p className="text-sm text-gray-400 uppercase tracking-wider">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Teams Management */}
      <div className="panel">
        <div className="flex justify-between items-center mb-6">
          <h2 className="panel-title m-0">
            <span className="text-2xl">🏢</span>
            Team Management
          </h2>
          <button className="btn btn-cyan text-xs">➕ Add Team</button>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          {["ALL", "ACTIVE", "BANNED"].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded border text-xs font-bold transition ${
                filterStatus === status
                  ? "bg-cyan-400/20 border-cyan-400 text-cyan-300"
                  : "border-cyan-400/30 text-cyan-400/60 hover:bg-cyan-400/10"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Teams Table */}
        {filteredTeams.length > 0 ? (
          <div className="space-y-2">
            {filteredTeams.map((team) => {
              const style = getStatusStyle(team.status);
              return (
                <div
                  key={team.id}
                  className={`p-4 rounded-lg border-2 ${style.border} ${style.bg} hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl font-bold">{team.name}</span>
                        <span className={`text-xl ${style.text}`}>{style.badge}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {team.members} members • Score: {team.score}
                      </div>
                    </div>

                    <div className="text-right mr-4">
                      {team.penaltyCount > 0 && (
                        <div className="text-xs text-orange-300 mb-1">
                          ⚠️ {team.penaltyCount} penalties
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button className="btn btn-cyan text-xs px-3!">
                        ✏️
                      </button>
                      {team.status === "BANNED" ? (
                        <button className="btn btn-green text-xs px-3!">
                          🔓
                        </button>
                      ) : (
                        <button className="btn btn-danger text-xs px-3!">
                          🔒
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">No teams found</p>
          </div>
        )}
      </div>

      {/* Penalties Section */}
      <div className="panel border-orange-400/30">
        <h2 className="panel-title">
          <span className="text-2xl">⚠️</span>
          Recent Penalties
        </h2>
        <div className="space-y-2">
          {[
            { team: "BugHunters", reason: "Wrong submission format", time: "2m ago" },
            { team: "Algorithm99", reason: "Timeout penalty", time: "5m ago" }
          ].map((penalty, idx) => (
            <div key={idx} className="p-4 rounded border-l-4 border-orange-400 bg-orange-400/5 flex justify-between items-center">
              <div>
                <p className="font-bold text-orange-300">{penalty.team}</p>
                <p className="text-xs text-gray-400">{penalty.reason}</p>
              </div>
              <div className="text-xs text-gray-500">{penalty.time}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}