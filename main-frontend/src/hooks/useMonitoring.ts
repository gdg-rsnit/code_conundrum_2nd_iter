import { useCallback, useEffect, useMemo, useState } from "react";

const API_URL = "http://localhost:5000/api";

const markTeamAsBanned = () => {
  const teamRaw = localStorage.getItem("cc_team");
  if (!teamRaw) return;

  try {
    const parsed = JSON.parse(teamRaw);
    parsed.banned = true;
    localStorage.setItem("cc_team", JSON.stringify(parsed));
  } catch {
    // ignore parse errors
  }
};

type EventType = "fullscreen_exit" | "tab_switch";

type UseMonitoringOptions = {
  teamId?: string | null;
  contestId?: string | null;
  enabled?: boolean;
  trackTabSwitches?: boolean;
};

export const useMonitoring = ({
  teamId,
  contestId,
  enabled = true,
  trackTabSwitches = true,
}: UseMonitoringOptions) => {
  const [fullscreenExitCount, setFullscreenExitCount] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [warning, setWarning] = useState<string | null>(null);

  const canTrack = useMemo(() => Boolean(enabled), [enabled]);

  const resolveTeamId = useCallback(() => {
    if (teamId) return String(teamId);

    const teamRaw = localStorage.getItem("cc_team");
    if (!teamRaw) return null;

    try {
      const parsed = JSON.parse(teamRaw);
      return parsed?.teamId ? String(parsed.teamId) : null;
    } catch {
      return null;
    }
  }, [teamId]);

  const resolveContestId = useCallback(() => {
    if (contestId) return String(contestId);

    const liveRoundRaw = localStorage.getItem("cc_live_round");
    if (!liveRoundRaw) return null;

    try {
      const parsed = JSON.parse(liveRoundRaw);
      return parsed?._id ? String(parsed._id) : null;
    } catch {
      return null;
    }
  }, [contestId]);

  const postEvent = useCallback(
    async (eventType: EventType) => {
      if (!canTrack) {
        return false;
      }

      const effectiveTeamId = resolveTeamId();
      const effectiveContestId = resolveContestId();
      if (!effectiveTeamId || !effectiveContestId) {
        return false;
      }

      const endpoint =
        eventType === "fullscreen_exit"
          ? `${API_URL}/monitor/fullscreen-exit`
          : `${API_URL}/monitor/tab-switch`;

      const payload = {
        teamId: effectiveTeamId,
        contestId: effectiveContestId,
        timestamp: new Date().toISOString(),
      };

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true,
        });

        if (response.status === 403) {
          markTeamAsBanned();
          window.location.href = "/banned";
          return false;
        }

        if (response.status === 401) {
          return false;
        }

        if (!response.ok) {
          return false;
        }

        const data = await response.json().catch(() => ({}));
        const summary = data?.data || {};

        if (typeof summary.fullscreenExitCount === "number") {
          setFullscreenExitCount(summary.fullscreenExitCount);
        }
        if (typeof summary.tabSwitchCount === "number") {
          setTabSwitchCount(summary.tabSwitchCount);
        }

        if (eventType === "fullscreen_exit") {
          setWarning("You exited fullscreen. This activity is being monitored.");
        }

        return true;
      } catch {
        // Ignore telemetry failures to avoid blocking contest flow.
        return false;
      }
    },
    [canTrack, resolveTeamId, resolveContestId]
  );

  const trackFullscreenExit = useCallback(() => {
    return postEvent("fullscreen_exit");
  }, [postEvent]);

  const trackTabSwitch = useCallback(() => {
    void postEvent("tab_switch");
  }, [postEvent]);

  useEffect(() => {
    if (!canTrack || !trackTabSwitches) {
      return;
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        trackTabSwitch();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [canTrack, trackTabSwitches, trackTabSwitch]);

  return {
    fullscreenExitCount,
    tabSwitchCount,
    warning,
    clearWarning: () => setWarning(null),
    trackFullscreenExit,
    trackTabSwitch,
  };
};

export default useMonitoring;
