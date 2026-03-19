import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useBanTeam, useMonitoringLogs, useMonitoringSummary, usePenalizeTeam } from "../hooks/monitoringHook.js";

const formatDateTime = (value) => {
  if (!value) return "-";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "-";
  return dt.toLocaleString();
};

export default function MonitoringPanel() {
  const [selected, setSelected] = useState({ teamId: "", contestId: "" });
  const [penaltyForm, setPenaltyForm] = useState({ scoreDeducted: "10", timeDeducted: "0", reason: "Fullscreen exit policy violation" });

  const { data: rows = [], isLoading } = useMonitoringSummary();
  const { data: logs = [], isLoading: logsLoading } = useMonitoringLogs({
    teamId: selected.teamId || undefined,
    contestId: selected.contestId || undefined,
    limit: 100,
  });

  const banTeamMutation = useBanTeam();
  const penalizeMutation = usePenalizeTeam();

  const sortedRows = useMemo(
    () => [...rows].sort((a, b) => {
      if (b.fullscreenExitCount !== a.fullscreenExitCount) {
        return b.fullscreenExitCount - a.fullscreenExitCount;
      }
      if (b.tabSwitchCount !== a.tabSwitchCount) {
        return b.tabSwitchCount - a.tabSwitchCount;
      }
      return String(b.updatedAt).localeCompare(String(a.updatedAt));
    }),
    [rows]
  );

  const submitBan = async (teamId) => {
    try {
      await banTeamMutation.mutateAsync({ teamId });
      toast.success("Team banned successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to ban team");
    }
  };

  const submitPenalty = async (teamId, contestId) => {
    const scoreDeducted = Number(penaltyForm.scoreDeducted || 0);
    const timeDeducted = Number(penaltyForm.timeDeducted || 0);

    if (scoreDeducted <= 0 && timeDeducted <= 0) {
      toast.error("Add score/time penalty value");
      return;
    }

    try {
      await penalizeMutation.mutateAsync({
        teamId,
        contestId,
        penalty: {
          scoreDeducted,
          timeDeducted,
          reason: penaltyForm.reason,
        },
      });
      toast.success("Penalty applied");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to apply penalty");
    }
  };

  return (
    <div className="space-y-6">
      <div className="panel mb-0">
        <h2 className="panel-title">📊 Monitoring Console</h2>
        <p className="text-sm text-gray-400">Realtime policy events. Auto-refresh interval: 5 seconds.</p>
      </div>

      <div className="panel mb-0 overflow-x-auto">
        <table className="w-full min-w-190 text-sm">
          <thead>
            <tr className="border-b border-cyan-500/30 text-cyan-300">
              <th className="py-3 px-2 text-left">Team</th>
              <th className="py-3 px-2 text-left">Contest</th>
              <th className="py-3 px-2 text-left">Fullscreen Exits</th>
              <th className="py-3 px-2 text-left">Tab Switches</th>
              <th className="py-3 px-2 text-left">Status</th>
              <th className="py-3 px-2 text-left">Last Event</th>
              <th className="py-3 px-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="py-6 px-2 text-gray-400">Loading monitoring data...</td></tr>
            ) : sortedRows.length === 0 ? (
              <tr><td colSpan={7} className="py-6 px-2 text-gray-400">No monitoring records yet.</td></tr>
            ) : (
              sortedRows.map((row) => (
                <tr key={`${row.teamId}-${row.contestId}`} className="border-b border-white/10">
                  <td className="py-3 px-2 font-semibold text-white">{row.teamName}</td>
                  <td className="py-3 px-2">{row.contestId}</td>
                  <td className="py-3 px-2 font-bold text-red-300">{row.fullscreenExitCount}</td>
                  <td className="py-3 px-2 font-bold text-orange-300">{row.tabSwitchCount}</td>
                  <td className="py-3 px-2">
                    {row.isBanned ? (
                      <span className="px-2 py-1 text-[10px] border border-red-400 text-red-300">BANNED</span>
                    ) : row.autoBanned ? (
                      <span className="px-2 py-1 text-[10px] border border-red-500 text-red-400">AUTO-BANNED</span>
                    ) : row.flagged ? (
                      <span className="px-2 py-1 text-[10px] border border-yellow-500 text-yellow-300">FLAGGED</span>
                    ) : (
                      <span className="px-2 py-1 text-[10px] border border-green-500 text-green-300">ACTIVE</span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-xs text-gray-400">{formatDateTime(row.updatedAt)}</td>
                  <td className="py-3 px-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        disabled={row.isBanned || banTeamMutation.isPending}
                        onClick={() => submitBan(row.teamId)}
                        className="btn btn-danger text-[10px] py-1 px-2 disabled:opacity-50"
                      >
                        BAN
                      </button>
                      <button
                        disabled={penalizeMutation.isPending}
                        onClick={() => submitPenalty(row.teamId, row.contestId)}
                        className="btn btn-orange text-[10px] py-1 px-2"
                      >
                        PENALIZE
                      </button>
                      <button
                        onClick={() => setSelected({ teamId: row.teamId, contestId: row.contestId })}
                        className="btn btn-cyan text-[10px] py-1 px-2"
                      >
                        VIEW LOGS
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="panel mb-0">
        <div className="flex flex-wrap gap-3 items-end mb-4">
          <div>
            <label className="text-xs text-gray-400">Score Deduction</label>
            <input
              value={penaltyForm.scoreDeducted}
              onChange={(e) => setPenaltyForm((prev) => ({ ...prev, scoreDeducted: e.target.value }))}
              className="input mb-0 w-40"
              type="number"
              min="0"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Time Deduction</label>
            <input
              value={penaltyForm.timeDeducted}
              onChange={(e) => setPenaltyForm((prev) => ({ ...prev, timeDeducted: e.target.value }))}
              className="input mb-0 w-40"
              type="number"
              min="0"
            />
          </div>
          <div className="flex-1 min-w-60">
            <label className="text-xs text-gray-400">Reason</label>
            <input
              value={penaltyForm.reason}
              onChange={(e) => setPenaltyForm((prev) => ({ ...prev, reason: e.target.value }))}
              className="input mb-0"
              type="text"
            />
          </div>
        </div>

        <h3 className="text-sm font-bold text-cyan-300 mb-3">Event Logs {selected.teamId ? `for ${selected.teamId}` : ""}</h3>
        <div className="max-h-96 overflow-auto border border-cyan-500/20 rounded">
          <table className="w-full text-xs">
            <thead className="bg-cyan-500/10 text-cyan-200">
              <tr>
                <th className="py-2 px-2 text-left">Timestamp</th>
                <th className="py-2 px-2 text-left">Event</th>
                <th className="py-2 px-2 text-left">IP</th>
                <th className="py-2 px-2 text-left">User Agent</th>
              </tr>
            </thead>
            <tbody>
              {logsLoading ? (
                <tr><td colSpan={4} className="py-3 px-2 text-gray-400">Loading logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={4} className="py-3 px-2 text-gray-400">Select a row to view logs.</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-b border-white/10">
                    <td className="py-2 px-2">{formatDateTime(log.timestamp)}</td>
                    <td className="py-2 px-2">{log.eventType}</td>
                    <td className="py-2 px-2">{log.ipAddress || "-"}</td>
                    <td className="py-2 px-2 truncate max-w-80" title={log.userAgent || ""}>{log.userAgent || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
