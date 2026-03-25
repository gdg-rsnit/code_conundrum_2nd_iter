import { useGetWaitingRoomSnapshot } from "../hooks/teamHook";
import Loading from "./Loading";

export default function WaitingRoomPanel() {
  const { data, isLoading, error } = useGetWaitingRoomSnapshot();

  if (isLoading) return <Loading />;

  if (error) {
    return (
      <div className="terminal-container">
        <h1 className="terminal-title">🛰️ WAITING ROOM MONITOR</h1>
        <p className="text-red-400">Unable to load waiting room data: {error.message}</p>
      </div>
    );
  }

  const waitingCount = data?.waitingCount ?? 0;
  const teams = data?.teams ?? [];

  return (
    <div className="terminal-container">
      <h1 className="terminal-title">🛰️ WAITING ROOM MONITOR</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="panel border-cyan-400/50 bg-linear-to-br from-cyan-400/10 to-cyan-400/5">
          <p className="text-sm text-gray-400 uppercase tracking-wider">Teams Waiting Now</p>
          <p className="text-5xl font-black text-cyan-300 mt-2">{waitingCount}</p>
          <p className="text-xs text-cyan-100/70 mt-3">Auto-refresh every 2 seconds</p>
        </div>
      </div>

      <div className="panel border-cyan-400/40">
        <h2 className="panel-title">Active Teams</h2>

        {teams.length === 0 ? (
          <p className="text-sm text-gray-400">No teams are currently active in the waiting room.</p>
        ) : (
          <div className="space-y-3">
            {teams.map((team) => (
              <div
                key={team.teamId}
                className="rounded border border-cyan-400/30 bg-cyan-400/5 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="font-bold text-cyan-200">{team.teamName}</p>
                  <p className="text-xs text-gray-400">{new Date(team.lastSeenAt).toLocaleTimeString()}</p>
                </div>
                <p className="text-xs text-gray-300 mt-1">{team.members.join(", ") || "No members"}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
