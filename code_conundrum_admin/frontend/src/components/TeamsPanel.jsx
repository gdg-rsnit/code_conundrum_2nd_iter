import { useState } from "react";
import toast from "react-hot-toast";
import { useGetAllTeams, useGetPenalizedTeams, useUpdateTeamStatus, usePenalizeTeams, useDeletePenalty } from "../hooks/teamHook";
import { useGetRounds } from "../hooks/roundHook";
import Loading from "./Loading";

export default function TeamsPanel() {
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [penaltyModal, setPenaltyModal] = useState(null);
  const [penaltyForm, setPenaltyForm] = useState({
    roundId: "",
    reason: "",
    scoreDeducted: 0,
    timeDeducted: 0,
  });
  
  // Fetch teams and penalties data
  const { data: teams = [], isLoading: teamsLoading, error: teamsError } = useGetAllTeams();
  const { data: penalties = [], isLoading: penaltiesLoading } = useGetPenalizedTeams();
  const { data: rounds = [] } = useGetRounds();
  const updateTeamStatusMutation = useUpdateTeamStatus();
  const penalizeTeamMutation = usePenalizeTeams();
  const deletePenaltyMutation = useDeletePenalty();

  // Calculate stats from real data
  const activeTeamsCount = teams.filter(t => !t.banned).length;
  const bannedTeamsCount = teams.filter(t => t.banned).length;
  const penalizedTeamsCount = penalties.length;

  const stats = [
    { label: "ACTIVE TEAMS", value: activeTeamsCount, color: "green", icon: "👥" },
    { label: "PENALIZED", value: penalizedTeamsCount, color: "orange", icon: "⚠️" },
    { label: "BANNED", value: bannedTeamsCount, color: "red", icon: "🚫" }
  ];

  // Filter teams based on status
  const filteredTeams = filterStatus === "ALL" 
    ? teams 
    : teams.filter(t => t.banned === (filterStatus === "BANNED"));

  // Count penalties per team
  const penaltyCountByTeam = penalties.reduce((acc, penalty) => {
    acc[penalty.teamId] = (acc[penalty.teamId] || 0) + 1;
    return acc;
  }, {});

  const getStatusStyle = (banned) => {
    return banned 
      ? { bg: "bg-red-400/10", border: "border-red-400/50", text: "text-red-300", badge: "🔴" }
      : { bg: "bg-green-400/10", border: "border-green-400/50", text: "text-green-300", badge: "🟢" };
  };

  const handleToggleBan = async (teamId, currentBannedStatus) => {
    const teamName = teams.find(t => t._id === teamId)?.teamName;
    const action = currentBannedStatus ? "unbanning" : "banning";
    const loadingToast = toast.loading(`${action} team...`);
    
    try {
      await updateTeamStatusMutation.mutateAsync({
        teamId,
        banned: !currentBannedStatus
      });
      toast.success(
        `${teamName} has been ${currentBannedStatus ? "unbanned" : "banned"} successfully!`,
        { id: loadingToast }
      );
    } catch (error) {
      toast.error(`Failed to ${action.slice(0, -3)} team: ${error.message}`, { id: loadingToast });
    }
  };

  const openPenaltyModal = (team) => {
    setPenaltyModal(team);
    setPenaltyForm({
      roundId: "",
      reason: "",
      scoreDeducted: 0,
      timeDeducted: 0,
    });
  };

  const closePenaltyModal = () => {
    setPenaltyModal(null);
    setPenaltyForm({
      roundId: "",
      reason: "",
      scoreDeducted: 0,
      timeDeducted: 0,
    });
  };

  const handlePenalizeTeam = async (e) => {
    e.preventDefault();
    
    if (!penaltyForm.roundId) {
      toast.error("Please select a round");
      return;
    }
    if (!penaltyForm.reason.trim()) {
      toast.error("Please provide a reason");
      return;
    }
    if (penaltyForm.scoreDeducted <= 0 && penaltyForm.timeDeducted <= 0) {
      toast.error("Please deduct at least score or time");
      return;
    }

    const loadingToast = toast.loading("Applying penalty...");
    
    try {
      await penalizeTeamMutation.mutateAsync({
        teamId: penaltyModal._id,
        payload: {
          roundId: penaltyForm.roundId,
          reason: penaltyForm.reason,
          scoreDeducted: Number(penaltyForm.scoreDeducted),
          timeDeducted: Number(penaltyForm.timeDeducted),
        }
      });
      toast.success(`Penalty applied to ${penaltyModal.teamName}!`, { id: loadingToast });
      closePenaltyModal();
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Failed to apply penalty";
      toast.error(message, { id: loadingToast });
    }
  };

  const handleDeletePenalty = async (penaltyId) => {
    const loadingToast = toast.loading("Deleting penalty...");
    
    try {
      await deletePenaltyMutation.mutateAsync(penaltyId);
      toast.success("Penalty deleted successfully!", { id: loadingToast });
    } catch (error) {
      const message = error.response?.data?.message || error.message || "Failed to delete penalty";
      toast.error(message, { id: loadingToast });
    }
  };

  if (teamsLoading || penaltiesLoading) return <Loading />;
  
  if (teamsError) {
    return (
      <div className="terminal-container">
        <p className="text-red-400">Error loading teams: {teamsError.message}</p>
      </div>
    );
  }

  return (
    <>
      <div className="terminal-container">
        <h1 className="terminal-title">👥 TEAMS MANAGEMENT</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {stats.map((stat) => {
            const gradientClass = {
              green: "from-green-400/10 to-green-400/5 border-green-400/50 shadow-green-400/20",
              orange: "from-orange-400/10 to-orange-400/5 border-orange-400/50 shadow-orange-400/20",
              red: "from-red-400/10 to-red-400/5 border-red-400/50 shadow-red-400/20"
            }[stat.color];

            return (
              <div
                key={stat.label}
                className={`panel bg-linear-to-br ${gradientClass}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-4xl font-black mb-2">{stat.value}</div>
                    <p className="text-sm text-gray-400 uppercase tracking-wider">{stat.label}</p>
                  </div>
                  <div className="text-5xl opacity-20">{stat.icon}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Teams Management */}
        <div className="panel">
          <div className="flex justify-between items-center mb-6">
            <h2 className="panel-title m-0">🔧 Manage Teams</h2>
            <button className="btn btn-cyan">+ ADD TEAM</button>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 mb-6">
            {["ALL", "ACTIVE","BANNED"].map((status) => (
              <button
                key={status}
                className={`btn ${filterStatus === status ? "btn-cyan" : "btn-secondary"} text-xs`}
                onClick={() => setFilterStatus(status)}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Teams List */}
          <div className="space-y-3">
            {filteredTeams.map((team) => {
              const style = getStatusStyle(team.banned);
              const penaltyCount = penaltyCountByTeam[team._id] || 0;

              return (
                <div
                  key={team._id}
                  className={`p-4 rounded border ${style.border} ${style.bg} flex justify-between items-center`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{style.badge}</span>
                      <div>
                        <p className={`font-bold ${style.text}`}>{team.teamName}</p>
                        <p className="text-xs text-gray-400">
                          {team.teamMembers?.join(", ") || "No members"}
                        </p>
                        {penaltyCount > 0 && (
                          <p className="text-xs text-orange-400 mt-1">
                            ⚠️ {penaltyCount} {penaltyCount === 1 ? "penalty" : "penalties"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="btn btn-cyan text-xs px-3!"
                      onClick={() => openPenaltyModal(team)}
                    >
                      ⚠️
                    </button>
                    {!team.banned ? (
                      <button
                        className="btn btn-green text-xs px-3!"
                        onClick={() => handleToggleBan(team._id, team.banned)}
                        disabled={updateTeamStatusMutation.isPending}
                      >
                        🔓
                      </button>
                    ) : (
                      <button
                        className="btn btn-danger text-xs px-3!"
                        onClick={() => handleToggleBan(team._id, team.banned)}
                        disabled={updateTeamStatusMutation.isPending}
                      >
                        🔒
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Penalties */}
        <div className="panel border-orange-400/30">
          <h2 className="panel-title">⚠️ Recent Penalties</h2>
          <div className="space-y-3">
            {penalties.slice(0, 10).map((penalty) => {
              const team = teams.find(t => t._id === penalty.teamId);
              const penaltyDate = new Date(penalty.createdAt);
              const now = new Date();
              const diffMs = now - penaltyDate;
              const diffMins = Math.floor(diffMs / 60000);
              const diffHours = Math.floor(diffMins / 60);
              const timeAgo = diffHours > 0
                ? `${diffHours}h ago`
                : diffMins > 0
                ? `${diffMins}m ago`
                : "just now";

              return (
                <div key={penalty._id} className="p-4 rounded border-l-4 border-orange-400 bg-orange-400/5 flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-bold text-orange-300">{team?.teamName || "Unknown Team"}</p>
                    <p className="text-xs text-gray-400">{penalty.reason}</p>
                    {penalty.scoreDeducted > 0 && (
                      <p className="text-xs text-red-300">Score: -{penalty.scoreDeducted}</p>
                    )}
                    {penalty.timeDeducted > 0 && (
                      <p className="text-xs text-red-300">Time: -{penalty.timeDeducted}s</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-gray-500">{timeAgo}</div>
                    <button
                      className="btn btn-danger text-xs px-2 py-1"
                      onClick={() => handleDeletePenalty(penalty._id)}
                      disabled={deletePenaltyMutation.isPending}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}

            {penalties.length === 0 && (
              <p className="text-center text-gray-500 py-8">No penalties recorded</p>
            )}
          </div>
        </div>
      </div>

      {/* Penalty Modal */}
      {penaltyModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="panel max-w-md w-full bg-orange-400/5 border-orange-400/50">
            <h3 className="text-xl font-bold text-orange-300 mb-4">
              ⚠️ Penalize Team: {penaltyModal.teamName}
            </h3>
            
            <form onSubmit={handlePenalizeTeam} className="space-y-4">
              <div>
                <label className="block text-xs text-cyan-300 mb-2">Select Round *</label>
                <select
                  className="input"
                  value={penaltyForm.roundId}
                  onChange={(e) => setPenaltyForm({ ...penaltyForm, roundId: e.target.value })}
                  required
                >
                  <option value="">-- Select Round --</option>
                  {rounds.map((round) => (
                    <option key={round._id} value={round._id}>
                      Round {round.roundNumber} ({round.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-cyan-300 mb-2">Reason *</label>
                <textarea
                  className="input min-h-20"
                  placeholder="Reason for penalty..."
                  value={penaltyForm.reason}
                  onChange={(e) => setPenaltyForm({ ...penaltyForm, reason: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-cyan-300 mb-2">Score Deducted</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={penaltyForm.scoreDeducted}
                    onChange={(e) => setPenaltyForm({ ...penaltyForm, scoreDeducted: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs text-cyan-300 mb-2">Time Deducted (s)</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={penaltyForm.timeDeducted}
                    onChange={(e) => setPenaltyForm({ ...penaltyForm, timeDeducted: e.target.value })}
                  />
                </div>
              </div>

              <p className="text-xs text-gray-400">
                * At least one of score or time must be deducted
              </p>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 btn btn-cyan"
                  disabled={penalizeTeamMutation.isPending}
                >
                  {penalizeTeamMutation.isPending ? "Applying..." : "Apply Penalty"}
                </button>
                <button
                  type="button"
                  className="flex-1 btn btn-danger"
                  onClick={closePenaltyModal}
                  disabled={penalizeTeamMutation.isPending}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
