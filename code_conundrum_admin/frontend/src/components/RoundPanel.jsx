import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  useGetRounds,
  useCreateRound,
  useDeleteRound,
  useStartRound,
  usePauseResumeRound,
  useExtendRound,
  useEndRound,
  useResetRound,
} from "../hooks/roundHook";
import Loading from "./Loading";

const formatHms = (totalSeconds) => {
  const safeSeconds = Math.max(0, Number(totalSeconds) || 0);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

// Helper to extract error message from various error formats
const getErrorMessage = (error, defaultMessage = "An error occurred") => {
  // Check for ZodError with issues array
  if (error.name === 'ZodError' && error.issues) {
    return error.issues.map(issue => issue.message).join(", ");
  }
  // Check for Zod errors (errors property exists)
  if (error.errors && Array.isArray(error.errors)) {
    return error.errors.map(err => err.message).join(", ");
  }
  // Check if error.response.data.error is an array (Zod validation errors from backend)
  if (Array.isArray(error.response?.data?.error)) {
    return error.response.data.error.map(err => err.message).join(", ");
  }
  // Check if error.response.data is an array (Zod validation errors)
  if (Array.isArray(error.response?.data)) {
    return error.response.data.map(err => err.message).join(", ");
  }
  // Check for standard message property
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  // Fallback to error.message or default
  return error.message || defaultMessage;
};

// Timer component for live rounds
const RoundTimer = ({ round }) => {
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (round.status !== "LIVE" || !round.endTime) {
      return;
    }

    const calculateTimeRemaining = () => {
      // remaining seconds
      const nowMs = round.isPaused && round.pauseStartAt
        ? new Date(round.pauseStartAt).getTime()
        : Date.now();
      const endMs = new Date(round.endTime).getTime();
      return Math.max(0, Math.floor((endMs - nowMs) / 1000));
    };

    setTimeRemaining(calculateTimeRemaining());

    const interval = setInterval(() => {
      // While paused, keep the rendered value stable.
      if (round.isPaused) {
        return;
      }

      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [round.status, round.endTime, round.isPaused]);

  if (round.status !== "LIVE") return null;

  const formattedRemaining = formatHms(timeRemaining);
  const percentage = Math.min(100, Math.max(0, (timeRemaining / round.duration) * 100));
  
  const colorClass = percentage > 50 
    ? "text-green-400" 
    : percentage > 20 
    ? "text-orange-400" 
    : "text-red-400";

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-400">Time Remaining</span>
        {round.isPaused && (
          <span className="text-orange-400 animate-pulse">⏸️ PAUSED</span>
        )}
      </div>
      <div className={`text-4xl font-mono font-black ${colorClass}`}>
        {formattedRemaining}
      </div>
      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${
            percentage > 50 ? 'bg-green-400' : percentage > 20 ? 'bg-orange-400' : 'bg-red-400'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default function RoundPanel() {
  const [roundForm, setRoundForm] = useState({
    roundNumber: "",
    duration: "",
  });
  const [roundErrors, setRoundErrors] = useState({});

  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendRound, setExtendRound] = useState(null);
  const [extraSeconds, setExtraSeconds] = useState("");

  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // Hooks
  const { data: rounds = [], isLoading, error } = useGetRounds();
  const createRoundMutation = useCreateRound();
  const deleteRoundMutation = useDeleteRound();
  const startRoundMutation = useStartRound();
  const pauseResumeRoundMutation = usePauseResumeRound();
  const extendRoundMutation = useExtendRound();
  const endRoundMutation = useEndRound();
  const resetRoundMutation = useResetRound();

  // Validate round creation
  const validateRound = () => {
    const errors = {};
    if (!roundForm.roundNumber || Number(roundForm.roundNumber) <= 0) {
      errors.roundNumber = "Valid round number required";
    }
    if (!roundForm.duration || Number(roundForm.duration) < 1) {
      errors.duration = "Minimum 1 minute required";
    }
    setRoundErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onCreateRound = async () => {
    if (!validateRound()) return;
    
    const loadingToast = toast.loading("Creating draft round...");
    
    try {
      await createRoundMutation.mutateAsync({
        roundNumber: Number(roundForm.roundNumber),
        // Backend expects seconds; UI input is in minutes.
        duration: Number(roundForm.duration) * 60,
      });
      toast.success("Round created successfully!", { id: loadingToast });
      setRoundForm({ roundNumber: "", duration: "" });
      setRoundErrors({});
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create round"), { id: loadingToast });
    }
  };

  const onStartRound = async (roundId, roundNumber) => {
    const loadingToast = toast.loading(`Starting Round ${roundNumber}...`);
    try {
      await startRoundMutation.mutateAsync({ roundId });
      toast.success(`Round ${roundNumber} is now LIVE! 🔴`, { id: loadingToast });
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to start round"), { id: loadingToast });
    }
  };

  const onPauseResumeRound = async (roundId, roundNumber, isPaused) => {
    const action = isPaused ? "Resuming" : "Pausing";
    const loadingToast = toast.loading(`${action} Round ${roundNumber}...`);
    try {
      await pauseResumeRoundMutation.mutateAsync({ roundId });
      toast.success(`Round ${roundNumber} ${isPaused ? 'resumed' : 'paused'}!`, { id: loadingToast });
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to pause/resume round"), { id: loadingToast });
    }
  };

  const openExtendModal = (round) => {
    setExtendRound(round);
    setExtraSeconds("");
    setShowExtendModal(true);
  };

  const closeExtendModal = () => {
    setExtendRound(null);
    setExtraSeconds("");
    setShowExtendModal(false);
  };

  const onExtendRound = async () => {
    if (!extraSeconds || Number(extraSeconds) <= 0) {
      toast.error("Please enter valid seconds");
      return;
    }

    const loadingToast = toast.loading("Extending round...");
    try {
      await extendRoundMutation.mutateAsync({
        roundId: extendRound._id,
        payload: { extraSeconds: Number(extraSeconds) }
      });
      toast.success(`Round extended by ${extraSeconds} seconds!`, { id: loadingToast });
      closeExtendModal();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to extend round"), { id: loadingToast });
    }
  };

  const openConfirmModal = (action) => {
    setConfirmAction(action);
    setShowConfirmModal(true);
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    
    closeConfirmModal();
    const loadingToast = toast.loading(confirmAction.loadingMessage);
    
    try {
      await confirmAction.mutationFn();
      toast.success(confirmAction.successMessage, { id: loadingToast });
    } catch (error) {
      toast.error(getErrorMessage(error, confirmAction.errorMessage), { id: loadingToast });
    }
  };

  const onEndRound = (roundId, roundNumber) => {
    openConfirmModal({
      title: "⏹️ End Round",
      message: `Are you sure you want to end Round ${roundNumber}?`,
      description: "This will stop the timer and lock submissions.",
      confirmText: "End Round",
      confirmStyle: "btn-danger",
      mutationFn: () => endRoundMutation.mutateAsync({ roundId }),
      loadingMessage: `Ending Round ${roundNumber}...`,
      successMessage: `Round ${roundNumber} has ended!`,
      errorMessage: "Failed to end round"
    });
  };

  const onResetRound = (roundId, roundNumber) => {
    openConfirmModal({
      title: "🔄 Reset Round",
      message: `Reset Round ${roundNumber}?`,
      description: "This will clear all submissions and penalties. The round will return to DRAFT status.",
      confirmText: "Reset Round",
      confirmStyle: "btn-orange",
      mutationFn: () => resetRoundMutation.mutateAsync({ roundId }),
      loadingMessage: `Resetting Round ${roundNumber}...`,
      successMessage: `Round ${roundNumber} has been reset!`,
      errorMessage: "Failed to reset round"
    });
  };

  const onDeleteRound = (roundId, roundNumber) => {
    openConfirmModal({
      title: "🗑️ Delete Round",
      message: `Delete Round ${roundNumber}?`,
      description: "This action cannot be undone! All questions, answers, submissions, and penalties will be permanently deleted.",
      confirmText: "Delete Forever",
      confirmStyle: "btn-danger",
      mutationFn: () => deleteRoundMutation.mutateAsync({ roundId }),
      loadingMessage: `Deleting Round ${roundNumber}...`,
      successMessage: `Round ${roundNumber} deleted!`,
      errorMessage: "Failed to delete round"
    });
  };

  // Helper to get status styling
  const getStatusStyle = (status) => {
    const styles = {
      DRAFT: { bg: "bg-orange-400/10", border: "border-orange-400", text: "text-orange-300", icon: "📝", glow: "shadow-orange-400/20" },
      LIVE: { bg: "bg-green-400/10", border: "border-green-400", text: "text-green-300", icon: "🔴", glow: "shadow-green-400/20" },
      ENDED: { bg: "bg-red-400/10", border: "border-red-400", text: "text-red-300", icon: "⏹️", glow: "shadow-red-400/20" }
    };
    return styles[status];
  };

  if (isLoading) return <Loading />;

  if (error) {
    return (
      <div className="terminal-container">
        <p className="text-red-400">Error loading rounds: {error.message}</p>
      </div>
    );
  }

  return (
    <>
      <div className="terminal-container">
        <h1 className="terminal-title">⏱️ ROUNDS MANAGEMENT</h1>

        {/* Create Draft Round Form */}
        <div className="panel bg-linear-to-br from-cyan-400/5 to-blue-400/5 border-cyan-400/50 mb-8">
          <h2 className="panel-title">
            <span className="text-2xl">➕</span>
            Create Draft Round
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-cyan-300 mb-2">Round Number</label>
              <input
                className={`input ${roundErrors.roundNumber ? "border-red-400 bg-red-400/5" : ""}`}
                placeholder="e.g., 1"
                type="number"
                min="1"
                value={roundForm.roundNumber}
                onChange={(e) => {
                  setRoundForm({ ...roundForm, roundNumber: e.target.value });
                  if (roundErrors.roundNumber) setRoundErrors({ ...roundErrors, roundNumber: "" });
                }}
              />
              {roundErrors.roundNumber && (
                <p className="text-xs text-red-400 mt-1">⚠️ {roundErrors.roundNumber}</p>
              )}
            </div>

            <div>
              <label className="block text-xs text-cyan-300 mb-2">Duration (minutes)</label>
              <input
                className={`input ${roundErrors.duration ? "border-red-400 bg-red-400/5" : ""}`}
                placeholder="e.g., 5"
                type="number"
                min="1"
                value={roundForm.duration}
                onChange={(e) => {
                  setRoundForm({ ...roundForm, duration: e.target.value });
                  if (roundErrors.duration) setRoundErrors({ ...roundErrors, duration: "" });
                }}
              />
              {roundErrors.duration && (
                <p className="text-xs text-red-400 mt-1">⚠️ {roundErrors.duration}</p>
              )}
            </div>
          </div>

          <button
            className="w-full btn btn-cyan font-bold uppercase tracking-wider hover:shadow-lg hover:shadow-cyan-400/50"
            onClick={onCreateRound}
            disabled={createRoundMutation.isPending}
          >
            🚀 {createRoundMutation.isPending ? "Creating..." : "Create Draft Round"}
          </button>
        </div>

        {/* Rounds Grid */}
        <div>
          <h2 className="text-lg font-bold mb-6 text-cyan-300">📊 All Rounds ({rounds.length})</h2>
          {rounds.length === 0 ? (
            <div className="panel text-center py-12">
              <p className="text-gray-500 text-lg mb-4">No rounds created yet</p>
              <p className="text-gray-600 text-sm">Create your first round above!</p>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
              {rounds.map((r) => {
                const style = getStatusStyle(r.status);
                return (
                  <div 
                    key={r._id} 
                    className={`panel ${style.bg} border-2 ${style.border} hover:shadow-xl ${style.glow} transition-all duration-300 hover:-translate-y-1`}
                  >
                    {/* Header with status */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-5xl font-black text-cyan-300">#{r.roundNumber}</div>
                        <p className="text-xs text-gray-400">Round</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full border ${style.border} ${style.bg}`}>
                        <span className="text-sm font-bold flex items-center gap-1">
                          {style.icon}
                          <span className={style.text}>{r.status}</span>
                        </span>
                      </div>
                    </div>

                    {/* Timer for LIVE rounds */}
                    {r.status === "LIVE" && (
                      <div className="mb-4 p-3 rounded bg-black/30 border border-green-400/30">
                        <RoundTimer round={r} />
                      </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-4 py-3 border-y border-cyan-400/20">
                      <div className="text-center">
                        <p className="text-sm font-bold text-green-400">{formatHms(r.duration)}</p>
                        <p className="text-xs text-gray-400">Duration</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-blue-400">
                          {r.startTime ? new Date(r.startTime).toLocaleTimeString() : "--:--"}
                        </p>
                        <p className="text-xs text-gray-400">Started</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-purple-300">
                          {r.endTime ? new Date(r.endTime).toLocaleTimeString() : "--:--"}
                        </p>
                        <p className="text-xs text-gray-400">Ends</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      {r.status === "DRAFT" && (
                        <>
                          <button 
                            className="w-full btn btn-green text-xs mb-2"
                            onClick={() => onStartRound(r._id, r.roundNumber)}
                            disabled={startRoundMutation.isPending}
                          >
                            ▶️ Start Round
                          </button>
                          <button 
                            className="w-full btn btn-danger text-xs"
                            onClick={() => onDeleteRound(r._id, r.roundNumber)}
                            disabled={deleteRoundMutation.isPending}
                          >
                            🗑️ Delete
                          </button>
                        </>
                      )}
                      {r.status === "LIVE" && (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            <button 
                              className="btn btn-orange text-xs"
                              onClick={() => onPauseResumeRound(r._id, r.roundNumber, r.isPaused)}
                              disabled={pauseResumeRoundMutation.isPending}
                            >
                              {r.isPaused ? "▶️ Resume" : "⏸️ Pause"}
                            </button>
                            <button 
                              className="btn btn-cyan text-xs"
                              onClick={() => openExtendModal(r)}
                            >
                              ⏱️ Extend
                            </button>
                          </div>
                          <button 
                            className="w-full btn btn-danger text-xs mt-2"
                            onClick={() => onEndRound(r._id, r.roundNumber)}
                            disabled={endRoundMutation.isPending}
                          >
                            ⏹️ End Round
                          </button>
                        </>
                      )}
                      {r.status === "ENDED" && (
                        <button 
                          className="w-full btn btn-orange text-xs"
                          onClick={() => onResetRound(r._id, r.roundNumber)}
                          disabled={resetRoundMutation.isPending}
                        >
                          🔄 Reset Round
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Extend Round Modal */}
      {showExtendModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="panel max-w-md w-full bg-orange-400/5 border-orange-400/50 shadow-2xl">
            <h3 className="text-xl font-bold text-orange-300 mb-4">
              ⏱️ Extend Round #{extendRound.roundNumber}
            </h3>
            
            <div className="mb-4">
              <label className="block text-xs text-cyan-300 mb-2">Extra Seconds</label>
              <input
                className="input"
                type="number"
                min="1"
                placeholder="e.g., 60"
                value={extraSeconds}
                onChange={(e) => setExtraSeconds(e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-2">
                Current duration: {formatHms(extendRound.duration)}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                className="flex-1 btn btn-cyan"
                onClick={onExtendRound}
                disabled={extendRoundMutation.isPending}
              >
                {extendRoundMutation.isPending ? "Extending..." : "Extend"}
              </button>
              <button
                className="flex-1 btn btn-danger"
                onClick={closeExtendModal}
                disabled={extendRoundMutation.isPending}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && confirmAction && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="panel max-w-md w-full bg-red-950/20 border-red-500/50 shadow-2xl shadow-red-500/20 animate-in fade-in zoom-in-95 duration-200">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-red-400 mb-2 flex items-center gap-2">
                {confirmAction.title}
              </h3>
              <div className="h-1 w-16 bg-red-500/50 rounded mb-4"></div>
            </div>
            
            <div className="mb-6 space-y-3">
              <p className="text-lg text-cyan-100 font-medium">
                {confirmAction.message}
              </p>
              <p className="text-sm text-gray-400 leading-relaxed border-l-2 border-orange-500/50 pl-4 py-2 bg-orange-950/10">
                ⚠️ {confirmAction.description}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                className="flex-1 btn btn-ghost text-gray-300 hover:text-white"
                onClick={closeConfirmModal}
              >
                Cancel
              </button>
              <button
                className={`flex-1 btn ${confirmAction.confirmStyle} font-bold uppercase tracking-wide`}
                onClick={handleConfirm}
              >
                {confirmAction.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
