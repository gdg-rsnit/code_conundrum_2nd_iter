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

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => Number(a.rank) - Number(b.rank)),
    [entries]
  );

  const topThree = useMemo(() => sortedEntries.slice(0, 3), [sortedEntries]);

  const podiumOrder = useMemo(() => {
    const first = topThree.find((entry) => Number(entry.rank) === 1);
    const second = topThree.find((entry) => Number(entry.rank) === 2);
    const third = topThree.find((entry) => Number(entry.rank) === 3);
    return [second, first, third].filter(Boolean);
  }, [topThree]);

  const podiumStyles = {
    1: {
      border: "border-yellow-400/80",
      glow: "0 0 18px rgba(250,204,21,0.45)",
      bg: "from-yellow-500/20 to-yellow-300/5",
      text: "text-yellow-300",
      size: "h-24",
      label: "COMMANDER",
    },
    2: {
      border: "border-slate-300/70",
      glow: "0 0 14px rgba(203,213,225,0.35)",
      bg: "from-slate-300/15 to-slate-200/5",
      text: "text-slate-200",
      size: "h-20",
      label: "VANGUARD",
    },
    3: {
      border: "border-amber-600/70",
      glow: "0 0 12px rgba(217,119,6,0.35)",
      bg: "from-amber-700/20 to-amber-500/5",
      text: "text-amber-400",
      size: "h-16",
      label: "STRIKER",
    },
  };

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
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-cyan-400/30 bg-linear-to-br from-[#061126] via-[#08162d] to-[#050c1d] p-6 md:p-8">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -left-10 -bottom-12 h-36 w-36 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[0.28em] text-cyan-400/70">CONTROL ROOM</p>
            <h1 className="mt-1 text-2xl font-black text-cyan-300 md:text-3xl">
              GALACTIC LEADERBOARD
            </h1>
            <p className="mt-1 text-xs text-cyan-100/70">Live ranking stream for admin monitoring</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest text-emerald-300">LIVE</span>
          </div>
        </div>
      </div>

      <div className="panel mb-0">
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          <label className="text-xs font-bold tracking-wide text-cyan-200/90">ROUND SELECTOR</label>
          <select
            value={selectedRound}
            onChange={(e) => setSelectedRound(e.target.value)}
            className="input max-w-60 mb-0"
          >
            {sortedRounds.map((round) => (
              <option key={round._id} value={round.roundNumber}>
                Round {round.roundNumber}
              </option>
            ))}
          </select>
          <span className="ml-auto rounded border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-[10px] font-bold text-cyan-200/80">
            AUTO REFRESH: 5s
          </span>
        </div>
      </div>

      {podiumOrder.length > 0 && (
        <div className="panel mb-0">
          <div className="mb-4 text-xs font-bold tracking-[0.22em] text-cyan-300/80">TOP COMMANDERS</div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {podiumOrder.map((entry) => {
              const rank = Number(entry.rank);
              const style = podiumStyles[rank] || podiumStyles[3];
              return (
                <div
                  key={`${entry.rank}-${entry.username}`}
                  className={`rounded-xl border bg-linear-to-b ${style.bg} p-4 ${style.border}`}
                  style={{ boxShadow: style.glow }}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className={`text-xs font-black ${style.text}`}>#{entry.rank}</span>
                    <span className="text-[10px] font-bold tracking-wide text-cyan-100/60">{style.label}</span>
                  </div>
                  <div className="text-sm font-black text-cyan-100 truncate">{entry.username}</div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded border border-cyan-500/20 bg-black/20 p-2">
                      <p className="text-[10px] text-cyan-100/60">SCORE</p>
                      <p className="text-sm font-bold text-cyan-200">{entry.score}</p>
                    </div>
                    <div className="rounded border border-cyan-500/20 bg-black/20 p-2">
                      <p className="text-[10px] text-cyan-100/60">TIME</p>
                      <p className="text-sm font-bold text-cyan-200">{formatSeconds(entry.timeSeconds)}</p>
                    </div>
                    <div className="rounded border border-cyan-500/20 bg-black/20 p-2">
                      <p className="text-[10px] text-cyan-100/60">ACC</p>
                      <p className="text-sm font-bold text-cyan-200">{Number(entry.accuracy || 0).toFixed(2)}%</p>
                    </div>
                  </div>
                  <div className={`mt-3 rounded ${style.size} border border-cyan-500/20 bg-black/20`} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="panel mb-0 overflow-hidden">
        {loadingEntries ? (
          <Loading />
        ) : (
          <>
            <div className="mb-3 text-xs font-bold tracking-[0.22em] text-cyan-300/80">ALL RANKINGS</div>
            <div className="overflow-x-auto rounded-xl border border-cyan-500/20">
              <table className="w-full min-w-190 text-sm">
                <thead>
                  <tr className="border-b border-cyan-500/30 bg-cyan-500/10 text-cyan-200">
                    <th className="py-3 px-3 text-left text-[11px] tracking-wide">RANK</th>
                    <th className="py-3 px-3 text-left text-[11px] tracking-wide">TEAM</th>
                    <th className="py-3 px-3 text-left text-[11px] tracking-wide">SCORE</th>
                    <th className="py-3 px-3 text-left text-[11px] tracking-wide">TIME</th>
                    <th className="py-3 px-3 text-left text-[11px] tracking-wide">ACCURACY</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedEntries.length === 0 ? (
                    <tr>
                      <td className="py-8 px-3 text-gray-400 text-center" colSpan={5}>
                        No leaderboard data available for this round yet.
                      </td>
                    </tr>
                  ) : (
                    sortedEntries.map((entry, index) => (
                      <tr
                        key={`${entry.rank}-${entry.username}`}
                        className={`border-b border-white/10 ${index % 2 === 0 ? "bg-black/20" : "bg-white/2"}`}
                      >
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex min-w-10 items-center justify-center rounded border px-2 py-1 text-xs font-black ${
                              Number(entry.rank) === 1
                                ? "border-yellow-400/70 text-yellow-300"
                                : Number(entry.rank) === 2
                                  ? "border-slate-300/70 text-slate-200"
                                  : Number(entry.rank) === 3
                                    ? "border-amber-600/70 text-amber-400"
                                    : "border-cyan-500/30 text-cyan-200"
                            }`}
                          >
                            #{entry.rank}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-cyan-100">{entry.username}</td>
                        <td className="py-3 px-3 font-mono text-cyan-200">{entry.score}</td>
                        <td className="py-3 px-3 font-mono text-cyan-100/80">{formatSeconds(entry.timeSeconds)}</td>
                        <td className="py-3 px-3 font-mono text-cyan-300">{Number(entry.accuracy || 0).toFixed(2)}%</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
