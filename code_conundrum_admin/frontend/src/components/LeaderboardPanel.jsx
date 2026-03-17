import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../lib/axios.js";
import { useGetRounds } from "../hooks/roundHook";
import Loading from "./Loading";

const formatSeconds = (seconds) => {
  const safe = Math.max(0, Number(seconds) || 0);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export default function LeaderboardPanel() {
  const { data: rounds = [], isLoading: roundsLoading } = useGetRounds();
  const [selectedRound, setSelectedRound] = useState("");
  const [entries, setEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(false);

  const sortedRounds = useMemo(
    () => [...rounds].sort((a, b) => Number(a.roundNumber) - Number(b.roundNumber)),
    [rounds]
  );

  useEffect(() => {
    if (!selectedRound && sortedRounds.length > 0) {
      setSelectedRound(String(sortedRounds[sortedRounds.length - 1].roundNumber));
    }
  }, [selectedRound, sortedRounds]);

  useEffect(() => {
    if (!selectedRound) return;

    let cancelled = false;

    const fetchLeaderboard = async (silent = false) => {
      if (!silent) setLoadingEntries(true);
      try {
        const { data } = await api.get(`/admin/leaderboard/${selectedRound}`);
        if (!cancelled) setEntries(Array.isArray(data) ? data : []);
      } catch (error) {
        if (!silent) toast.error(error?.response?.data?.error || "Failed to fetch leaderboard");
        if (!cancelled) setEntries([]);
      } finally {
        if (!cancelled && !silent) setLoadingEntries(false);
      }
    };

    fetchLeaderboard();
    const interval = setInterval(() => fetchLeaderboard(true), 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [selectedRound]);

  if (roundsLoading) return <Loading />;

  return (
    <div className="terminal-container">
      <h1 className="terminal-title">🏆 LIVE LEADERBOARD</h1>

      <div className="panel mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm text-gray-300">Round:</label>
          <select
            value={selectedRound}
            onChange={(e) => setSelectedRound(e.target.value)}
            className="input max-w-60"
          >
            {sortedRounds.map((round) => (
              <option key={round._id} value={round.roundNumber}>
                Round {round.roundNumber}
              </option>
            ))}
          </select>
          <span className="text-xs text-gray-400">Auto-refresh: 5s</span>
        </div>
      </div>

      <div className="panel overflow-x-auto">
        {loadingEntries ? (
          <Loading />
        ) : (
          <table className="w-full min-w-170 text-sm">
            <thead>
              <tr className="border-b border-cyan-500/30 text-cyan-300">
                <th className="py-3 px-2 text-left">Rank</th>
                <th className="py-3 px-2 text-left">Team</th>
                <th className="py-3 px-2 text-left">Score</th>
                <th className="py-3 px-2 text-left">Time</th>
                <th className="py-3 px-2 text-left">Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td className="py-6 px-2 text-gray-400" colSpan={5}>
                    No leaderboard data available for this round yet.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={`${entry.rank}-${entry.username}`} className="border-b border-white/10">
                    <td className="py-3 px-2 text-cyan-300 font-bold">#{entry.rank}</td>
                    <td className="py-3 px-2">{entry.username}</td>
                    <td className="py-3 px-2">{entry.score}</td>
                    <td className="py-3 px-2">{formatSeconds(entry.timeSeconds)}</td>
                    <td className="py-3 px-2">{Number(entry.accuracy || 0).toFixed(2)}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
