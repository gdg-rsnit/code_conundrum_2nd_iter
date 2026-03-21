import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import StarfieldBackground from '@/components/StarfieldBackground';
import PixelBadge from '@/components/PixelBadge';
import { cn } from '@/lib/utils';
import { Maximize2, Loader2, Minimize2 } from 'lucide-react';
import { toast } from 'sonner';
import useMonitoring from '@/hooks/useMonitoring';
import { handleUnauthorized } from '@/lib/authSession';

const API_URL = 'http://localhost:5000/api';

const markTeamAsBanned = () => {
  const teamRaw = localStorage.getItem('cc_team');
  if (!teamRaw) return;
  try {
    const parsed = JSON.parse(teamRaw);
    parsed.banned = true;
    localStorage.setItem('cc_team', JSON.stringify(parsed));
  } catch {
    // ignore parse errors
  }
};

const shuffleArray = <T,>(arr: T[]): T[] => {
  const next = [...arr];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
};

const Contest = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<any[]>([]);
  const [snippets, setSnippets] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [dragging, setDragging] = useState<string | null>(null);
  const [selectedSnippet, setSelectedSnippet] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'problems' | 'snippets'>('problems');
  const [timeLeft, setTimeLeft] = useState(0);
  const [roundDuration, setRoundDuration] = useState(0);
  const [liveRoundId, setLiveRoundId] = useState<string | null>(null);
  const [liveRoundNumber, setLiveRoundNumber] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [allowExitFullscreen, setAllowExitFullscreen] = useState(false);
  const [expandedProblem, setExpandedProblem] = useState<{title: string, content: string} | null>(null);
  const [expandedSnippet, setExpandedSnippet] = useState<{title: string, content: string, htmlContent: any} | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const fullscreenWasActiveRef = useRef<boolean>(Boolean(document.fullscreenElement));

  const stored = localStorage.getItem('cc_team');
  const team = stored ? JSON.parse(stored) : { teamName: 'TEAM', round: '1' };
  const {
    fullscreenExitCount,
    tabSwitchCount,
    warning,
    clearWarning,
    trackFullscreenExit,
  } = useMonitoring({
    teamId: team?.teamId,
    contestId: liveRoundId,
    enabled: !locked,
  });

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        toast.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      // FullscreenEnforcer will handle the overlay if they exit
      document.exitFullscreen().catch(() => {});
    }
  };

  // Request fullscreen when contest loads (redundant but kept for immediate trigger if not yet active)
  useEffect(() => {
    if (!isLoading && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }, [isLoading]);

  // Prevent accidental ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block ESC key while contest is active (not submitted yet)
      if (e.key === 'Escape' && !allowExitFullscreen && isFullscreen) {
        e.preventDefault();
        toast.error('You cannot exit fullscreen until you submit or the round ends.');
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [allowExitFullscreen, isFullscreen]);

  // Cleanup: exit fullscreen when component unmounts or navigation happens
  useEffect(() => {
    return () => {
      if (allowExitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [allowExitFullscreen]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const isBanned = Boolean(team?.banned || team?.team?.banned);
        if (isBanned) {
          toast.error('Your team is banned and cannot enter the contest.');
          navigate('/waiting-room');
          return;
        }

        // 1. Get Live Round
        const roundRes = await fetch(`${API_URL}/admin/round`, { credentials: 'include' });
        if (roundRes.status === 403) {
          markTeamAsBanned();
          toast.error('Your team is banned and cannot enter the contest.');
          navigate('/banned');
          return;
        }
        if (roundRes.status === 401) {
          handleUnauthorized(navigate, '/home');
          return;
        }
        const roundData = await roundRes.json();
        const liveRound = roundData.data.find((r: any) => r.status === 'LIVE');

        if (!liveRound) {
          toast.error('No live round found');
          navigate('/waiting-room');
          return;
        }

        // 2. Set timer
        const startTime = new Date(liveRound.startTime).getTime();
        const endTime = new Date(liveRound.endTime).getTime();
        const now = new Date().getTime();
        const remaining = now < startTime
          ? Math.max(0, Math.floor((endTime - startTime) / 1000))
          : Math.max(0, Math.floor((endTime - now) / 1000));
        setTimeLeft(remaining);
        setRoundDuration(Number(liveRound.duration || 0));
        setLiveRoundId(liveRound._id);
        setLiveRoundNumber(Number(liveRound.roundNumber || 0));

        if (team?.teamId) {
          const submissionRes = await fetch(
            `${API_URL}/submissions?teamId=${team.teamId}&roundId=${liveRound._id}`,
            { credentials: 'include' }
          );
          if (submissionRes.status === 403) {
            markTeamAsBanned();
            toast.error('Your team is banned and cannot enter the contest.');
            navigate('/banned');
            return;
          }
          if (submissionRes.status === 401) {
            handleUnauthorized(navigate, '/home');
            return;
          }
          const submissionData = await submissionRes.json().catch(() => ({}));
          if (submissionRes.ok && Array.isArray(submissionData?.data) && submissionData.data.length > 0) {
            const existing = submissionData.data[0];
            const rawSolvedCount = Number(existing?.questionsSolved || 0);
            const rawTotalQuestions = Number(existing?.totalQuestions || 0);
            const solvedCount =
              rawSolvedCount > 0 && rawSolvedCount % 10 === 0
                ? Math.floor(rawSolvedCount / 10)
                : rawSolvedCount;
            const normalizedTotalQuestions =
              rawTotalQuestions > 0 && rawTotalQuestions % 10 === 0
                ? Math.floor(rawTotalQuestions / 10)
                : rawTotalQuestions;
            const accuracyPct = Number(existing?.accuracy || 0);
            const inferredTotalFromAccuracy =
              accuracyPct > 0
                ? Math.round((solvedCount * 100) / accuracyPct)
                : 0;
            const totalQuestions = Math.max(
              normalizedTotalQuestions,
              questions.length,
              inferredTotalFromAccuracy,
              solvedCount
            );

            localStorage.setItem(`cc_submitted_${team.teamId}_${liveRound._id}`, 'true');
            localStorage.setItem('cc_result', JSON.stringify({
              score: solvedCount,
              total: totalQuestions,
              timeTaken: Number(existing?.timeSeconds || 0),
              accuracy: accuracyPct,
              matchedCount: solvedCount
            }));
            navigate('/round-complete');
            return;
          }

          // Backend is source of truth: clear stale local submitted/result state for this round.
          localStorage.removeItem(`cc_submitted_${team.teamId}_${liveRound._id}`);
          localStorage.removeItem('cc_result');
        }

        localStorage.setItem('cc_live_round', JSON.stringify({
          _id: liveRound._id,
          roundNumber: Number(liveRound.roundNumber || 0),
          duration: Number(liveRound.duration || 0)
        }));

        // 3. Get Questions
        const qRes = await fetch(`${API_URL}/admin/questions/round/${liveRound._id}`, { credentials: 'include' });
        if (qRes.status === 403) {
          markTeamAsBanned();
          toast.error('Your team is banned and cannot enter the contest.');
          navigate('/banned');
          return;
        }
        if (qRes.status === 401) {
          handleUnauthorized(navigate, '/home');
          return;
        }
        const qData = await qRes.json();
        
        // 4. Get Answers (Snippets)
        const aRes = await fetch(`${API_URL}/admin/answers/round/${liveRound._id}`, { credentials: 'include' });
        if (aRes.status === 403) {
          markTeamAsBanned();
          toast.error('Your team is banned and cannot enter the contest.');
          navigate('/banned');
          return;
        }
        if (aRes.status === 401) {
          handleUnauthorized(navigate, '/home');
          return;
        }
        const aData = await aRes.json();

        const shuffledQuestions = shuffleArray(qData.data || []);
        const shuffledAnswers = shuffleArray(aData.data || []);

        setQuestions(shuffledQuestions.map((q: any, i: number) => ({
          id: q._id,
          label: `Q${i + 1}`,
          text: q.question,
          correctAnswerId: q.correctAnswerId
        })));

        setSnippets(shuffledAnswers.map((a: any, i: number) => ({
          id: a._id,
          label: `SNIPPET ${String.fromCharCode(65 + i)}`,
          code: a.code
        })));

        setIsLoading(false);
      } catch (error) {
        console.error('Fetch error:', error);
        toast.error('Failed to load mission data');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Sync timer with backend - check for pause/resume and recalculate remaining time
  useEffect(() => {
    if (isLoading || locked) return;

    const syncTimer = async () => {
      try {
        const roundRes = await fetch(`${API_URL}/admin/round`, { credentials: 'include' });
        if (roundRes.status === 403) {
          markTeamAsBanned();
          toast.error('Your team is banned and cannot enter the contest.');
          navigate('/banned');
          return;
        }
        if (roundRes.status === 401) {
          handleUnauthorized(navigate, '/home');
          return;
        }
        const roundData = await roundRes.json();
        const liveRound = roundData.data.find((r: any) => r._id === liveRoundId);

        if (!liveRound || liveRound.status !== 'LIVE') {
          return;
        }

        // Check if round is paused
        if (liveRound.isPaused) {
          clearInterval(timerRef.current);
          return;
        }

        // Recalculate time remaining based on server endTime
        const now = new Date().getTime();
        const endTime = new Date(liveRound.endTime).getTime();
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
        
        setTimeLeft(remaining);
      } catch (error) {
        console.error('Timer sync error:', error);
      }
    };

    // Sync every 2 seconds
    const syncInterval = setInterval(syncTimer, 2000);
    return () => clearInterval(syncInterval);
  }, [isLoading, locked, liveRoundId]);

  useEffect(() => {
    if (timeLeft > 0 && !locked) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timeLeft, locked]);

  useEffect(() => {
    if (timeLeft === 0 && !locked && !isLoading) {
      setAllowExitFullscreen(true);
      handleSubmit('auto-timeout');
    }
  }, [timeLeft, locked, isLoading]);

  const assignedSnippets = new Set(Object.values(assignments));
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const percentage = roundDuration > 0 ? (timeLeft / roundDuration) * 100 : 0;
  const timerColor = timeLeft > 300 ? '#22C55E' : timeLeft > 60 ? '#EAB308' : '#EF4444';

  const handleDragStart = (snippetId: string) => {
    if (locked) return;
    setDragging(snippetId);
  };

  const handleDrop = useCallback((problemId: string) => {
    if (locked) return;
    if (dragging) {
      const newAssignments = { ...assignments };
      Object.keys(newAssignments).forEach(k => {
        if (newAssignments[k] === dragging) delete newAssignments[k];
      });
      newAssignments[problemId] = dragging;
      setAssignments(newAssignments);
      setDragging(null);
    }
  }, [dragging, assignments, locked]);

  const handleTapAssign = (problemId: string) => {
    if (locked) return;
    if (selectedSnippet) {
      const newAssignments = { ...assignments };
      Object.keys(newAssignments).forEach(k => {
        if (newAssignments[k] === selectedSnippet) delete newAssignments[k];
      });
      newAssignments[problemId] = selectedSnippet;
      setAssignments(newAssignments);
      setSelectedSnippet(null);
    }
  };

  const removeAssignment = (problemId: string) => {
    if (locked) return;
    const newAssignments = { ...assignments };
    delete newAssignments[problemId];
    setAssignments(newAssignments);
  };

  const getSnippet = (id: string) => snippets.find(s => s.id === id);
  const matchedCount = Object.keys(assignments).length;

  const handleSubmit = async (source: 'manual' | 'auto-timeout' = 'manual') => {
    if (locked) return;

    setLocked(true);
    clearInterval(timerRef.current);

    const teamId = team?.teamId;
    const roundId = liveRoundId;

    const submittedAnswers = questions
      .filter((q) => assignments[q.id])
      .map((q) => ({
        questionId: q.id,
        selectedAnswer: assignments[q.id]
      }));

    const questionsSolved = questions.reduce((count, q) => {
      return count + (assignments[q.id] && assignments[q.id] === q.correctAnswerId ? 1 : 0);
    }, 0);

    const timeSpentSeconds = Math.max(0, roundDuration - timeLeft);
    const accuracy = questions.length > 0
      ? Number(((questionsSolved / questions.length) * 100).toFixed(2))
      : 0;

    const payload = {
      teamId,
      roundId,
      questionsSolved,
      timeSeconds: timeSpentSeconds,
      submittedAt: new Date().toISOString(),
      accuracy,
      // Extra details for traceability/client analytics (backend can ignore unknown keys)
      answers: submittedAnswers,
      source,
      totalQuestions: questions.length,
      matchedCount,
      assignments
    };

    localStorage.setItem('cc_result', JSON.stringify({
      score: questionsSolved,
      total: questions.length,
      timeTaken: timeSpentSeconds,
      accuracy,
      matchedCount
    }));

    if (!teamId || !roundId) {
      toast.error('Missing team or round context for submission.');
      navigate('/round-complete');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (response.status === 403) {
        markTeamAsBanned();
        toast.error('Your team is banned and cannot enter the contest.');
        navigate('/banned');
        return;
      }
      if (response.status === 401) {
        handleUnauthorized(navigate, '/home');
        return;
      }

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(responseData?.message || 'Failed to submit round data');
      }

      localStorage.setItem(`cc_submitted_${teamId}_${roundId}`, 'true');

      const submission = responseData?.data || {};
      localStorage.setItem('cc_result', JSON.stringify({
        score: Number(submission?.questionsSolved ?? questionsSolved),
        total: questions.length,
        timeTaken: Number(submission?.timeSeconds ?? timeSpentSeconds),
        accuracy: Number(submission?.accuracy ?? accuracy),
        matchedCount
      }));

      toast.success('Submission sent successfully. Leaderboard is updating live.');
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error?.message || 'Submission failed.');
    }

    // Allow fullscreen exit and exit fullscreen
    sessionStorage.setItem(
      'cc_skip_fullscreen_enforcer_until',
      String(Date.now() + 3000)
    );
    setAllowExitFullscreen(true);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    setTimeout(() => {
      navigate('/round-complete');
    }, 1200);
  };

  const highlightCode = (code: string) => {
    return code.split('\n').map((line, i) => {
      let highlighted = line
        .replace(/(def |return |if |for |in |while |import |from |class |else |elif |and |or |not |True|False|None)/g, '<span style="color:#00F5FF">$1</span>')
        .replace(/(\'[^\']*\'|\"[^\"]*\")/g, '<span style="color:#F472B6">$1</span>')
        .replace(/(#.*)/g, '<span style="color:#6B7280">$1</span>');
      return <div key={i} dangerouslySetInnerHTML={{ __html: highlighted }} />;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-space-navy flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <span className="font-pixel text-primary text-xs animate-pulse">INITIATING MISSION UPLINK...</span>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen scanline-overlay">
      <StarfieldBackground showClouds={false} showPlanets={false} opacity={0.2} />

      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-space-navy/95 border-b-2 border-primary/20 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PixelBadge variant="cyan">ROUND 0{team.round}</PixelBadge>
            <span className="hidden sm:inline font-pixel text-[8px] text-muted-foreground">{team.teamName?.toUpperCase()}</span>
            <button 
              onClick={toggleFullscreen}
              className="p-1 hover:bg-primary/20 rounded transition-colors text-primary"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
          <div
            className="font-pixel text-xl md:text-2xl tracking-widest"
            style={{ color: timerColor, filter: `drop-shadow(0 0 8px ${timerColor})` }}
          >
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div className="flex items-center gap-3">
            <span className="font-pixel text-[8px] text-muted-foreground">
              MATCHED: {matchedCount}/{questions.length}
            </span>
            <span className="hidden sm:inline font-pixel text-[8px] text-destructive/90">
              FS EXIT: {fullscreenExitCount}
            </span>
            <span className="hidden sm:inline font-pixel text-[8px] text-accent/90">
              TAB SWITCH: {tabSwitchCount}
            </span>
            <button
              onClick={() => handleSubmit('manual')}
              disabled={locked}
              className="font-pixel text-[8px] bg-secondary text-secondary-foreground px-3 py-1.5 border-2 border-secondary/60 hover:bg-secondary/80 disabled:opacity-50 transition-all"
            >
              [ SUBMIT ]
            </button>
          </div>
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="md:hidden fixed top-[44px] left-0 right-0 z-30 bg-space-navy/95 flex border-b-2 border-primary/20">
        <button
          className={cn(
            'flex-1 font-pixel text-[9px] py-2 transition-all',
            activeTab === 'problems' ? 'bg-secondary/20 text-secondary' : 'text-muted-foreground'
          )}
          onClick={() => setActiveTab('problems')}
        >
          PROBLEMS
        </button>
        <button
          className={cn(
            'flex-1 font-pixel text-[9px] py-2 transition-all',
            activeTab === 'snippets' ? 'bg-accent/20 text-accent' : 'text-muted-foreground'
          )}
          onClick={() => setActiveTab('snippets')}
        >
          SNIPPETS
        </button>
      </div>

      {/* Main split area */}
      <div className="relative z-10 pt-[44px] md:pt-[44px] min-h-screen flex">
        {/* LEFT: Problems */}
        <div
          className={cn(
            'relative w-full md:w-1/2',
            activeTab !== 'problems' && 'hidden md:block'
          )}
          style={{ height: 'calc(100vh - 44px)' }}
        >
          <div className="absolute inset-0 overflow-y-auto p-4 space-y-4" style={{ paddingTop: '1rem' }}>
            <div className="font-pixel text-[10px] text-secondary border-b-2 border-secondary/30 pb-2 mb-4">
              [ MISSION OBJECTIVES ]
            </div>
            {questions.map((p) => (
              <div
                key={p.id}
                className="bg-space-navy border border-muted-foreground/10 p-4"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(p.id)}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 flex-shrink-0 border-2 border-primary flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors" onClick={() => setExpandedProblem({ title: `PROBLEM ${p.label}`, content: p.text })}>
                    <span className="font-pixel text-[8px] text-primary">{p.label}</span>
                  </div>
                  <button
                    type="button"
                    className="flex-1 text-left"
                    onClick={() => setExpandedProblem({ title: `PROBLEM ${p.label}`, content: p.text })}
                    title="Open full question"
                  >
                    <span className="block text-xs text-muted-foreground font-mono-tech leading-relaxed hover:text-primary transition-colors max-h-20 overflow-y-auto pr-1">
                      {p.text}
                    </span>
                  </button>
                </div>

                {/* Drop Zone */}
                {assignments[p.id] ? (
                  <div 
                    className="relative border-2 border-primary bg-space-navy/50 p-3 cursor-grab active:cursor-grabbing hover:bg-space-navy/70 transition-colors" 
                    style={{ filter: 'drop-shadow(0 0 4px #00F5FF)' }}
                    draggable={!locked}
                    onDragStart={(e) => {
                      e.stopPropagation();
                      handleDragStart(assignments[p.id]);
                    }}
                  >
                    {!locked && (
                      <button
                        onClick={(e) => { e.stopPropagation(); removeAssignment(p.id); }}
                        className="absolute top-1 right-1 z-10 font-pixel text-[8px] text-destructive hover:text-destructive/80"
                      >
                        [X]
                      </button>
                    )}
                    {!locked && selectedSnippet && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTapAssign(p.id);
                        }}
                        className="absolute top-1 right-8 z-10 font-pixel text-[8px] text-primary hover:text-primary/80"
                      >
                        [SET]
                      </button>
                    )}
                    <PixelBadge variant="cyan" className="mb-2">{getSnippet(assignments[p.id])?.label}</PixelBadge>
                    <pre className="text-[10px] text-muted-foreground font-mono-tech whitespace-pre-wrap max-h-28 overflow-y-auto pr-1">
                      {highlightCode(getSnippet(assignments[p.id])?.code || '')}
                    </pre>
                  </div>
                ) : (
                  <div className={cn(
                    'border-2 border-dashed border-muted-foreground/20 min-h-[48px] flex items-center justify-center transition-all',
                    dragging && 'border-primary border-solid animate-pulse-glow',
                    selectedSnippet && 'border-primary/60 bg-primary/5'
                  )} onClick={() => handleTapAssign(p.id)}>
                    <span className="font-mono-tech text-[10px] text-muted-foreground/40">
                      {selectedSnippet ? '[ TAP TO ASSIGN ]' : '[ DROP CODE HERE ]'}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Problem Expand Modal */}
          {expandedProblem && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-4" onClick={() => setExpandedProblem(null)}>
              <div className="bg-space-navy border-2 border-primary w-full max-h-[85%] overflow-y-auto relative flex flex-col p-6" onClick={e => e.stopPropagation()}>
                <div className="mb-4 flex items-center gap-4">
                  <PixelBadge variant="cyan">{expandedProblem.title}</PixelBadge>
                </div>
                <p className="text-sm md:text-base text-foreground font-mono-tech leading-relaxed whitespace-pre-wrap flex-1">{expandedProblem.content}</p>
                <div className="mt-8 flex justify-center">
                  <button onClick={() => setExpandedProblem(null)} className="font-pixel text-[10px] bg-primary text-background px-6 py-3 hover:bg-primary/80 transition-colors w-full">[ CLOSE ]</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Divider (desktop) */}
        <div className="hidden md:block w-[2px] bg-primary/50" style={{ filter: 'drop-shadow(0 0 4px #00F5FF)' }} />

        {/* RIGHT: Code Snippets */}
        <div
          className={cn(
            'relative w-full md:w-1/2',
            activeTab !== 'snippets' && 'hidden md:block'
          )}
          style={{ height: 'calc(100vh - 44px)' }}
        >
          <div 
            className="absolute inset-0 overflow-y-auto p-4 space-y-3" 
            style={{ paddingTop: '1rem' }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (locked || !dragging) return;
              // Dropped back in arsenal -> just un-assign
              const newAssignments = { ...assignments };
              Object.keys(newAssignments).forEach(k => {
                if (newAssignments[k] === dragging) delete newAssignments[k];
              });
              setAssignments(newAssignments);
              setDragging(null);
            }}
          >
            <div className="font-pixel text-[10px] text-accent border-b-2 border-accent/30 pb-2 mb-4">
              [ CODE ARSENAL ]
            </div>
            {snippets.map((s) => {
              const deployed = assignedSnippets.has(s.id);
              const selected = selectedSnippet === s.id;
              return (
                <div
                  key={s.id}
                  draggable={!deployed && !locked}
                  onDragStart={() => handleDragStart(s.id)}
                  onDragEnd={() => setDragging(null)}
                  onClick={() => setExpandedSnippet({ title: s.label, content: s.code, htmlContent: highlightCode(s.code) })}
                  className={cn(
                    'bg-[#060612] p-3 border-2 border-accent/40 cursor-grab transition-all',
                    deployed && 'opacity-40 cursor-default',
                    selected && 'border-primary',
                    !deployed && !locked && 'hover:border-accent hover:scale-[1.01]'
                  )}
                  style={selected ? { filter: 'drop-shadow(0 0 6px #00F5FF)' } : undefined}
                >
                  <div className="flex items-center justify-between mb-2">
                    <PixelBadge variant={deployed ? 'red' : selected ? 'cyan' : 'violet'}>
                      {s.label}
                    </PixelBadge>
                    <div className="flex items-center gap-3 ml-auto">
                      {deployed && (
                        <span className="font-pixel text-[7px] text-muted-foreground">DEPLOYED</span>
                      )}
                      {selected && (
                        <span className="font-pixel text-[7px] text-primary animate-blink-cursor">SELECTED</span>
                      )}
                      {!deployed && !locked && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSnippet(selected ? null : s.id);
                          }}
                          className="font-pixel text-[7px] text-primary hover:text-primary/80"
                          title={selected ? 'Unselect snippet' : 'Select snippet'}
                        >
                          {selected ? '[UNSELECT]' : '[SELECT]'}
                        </button>
                      )}
                      <button
                        title="Expand Answer"
                        onClick={(e) => { e.stopPropagation(); setExpandedSnippet({ title: s.label, content: s.code, htmlContent: highlightCode(s.code) }); }}
                        className="text-muted-foreground hover:text-accent transition-all duration-300 hover:scale-110 focus:outline-none"
                        aria-label="Expand Answer"
                      >
                        <Maximize2 size={16} />
                      </button>
                    </div>
                  </div>
                  <pre className="text-[11px] font-mono-tech whitespace-pre-wrap leading-relaxed text-muted-foreground max-h-32 overflow-y-auto pr-1">
                    {highlightCode(s.code)}
                  </pre>
                </div>
              );
            })}
          </div>

          {/* Snippet Expand Modal */}
          {expandedSnippet && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-4" onClick={() => setExpandedSnippet(null)}>
              <div className="bg-space-navy border-2 border-primary w-full max-h-[85%] overflow-y-auto relative flex flex-col p-6" onClick={e => e.stopPropagation()}>
                <div className="mb-4 flex items-center gap-4">
                  <PixelBadge variant="violet">{expandedSnippet.title}</PixelBadge>
                </div>
                <pre className="text-sm md:text-base font-mono-tech whitespace-pre-wrap leading-relaxed bg-[#060612] p-4 border border-accent/20 flex-1">{expandedSnippet.htmlContent}</pre>
                <div className="mt-8 flex justify-center">
                  <button onClick={() => setExpandedSnippet(null)} className="font-pixel text-[10px] bg-primary text-background px-6 py-3 hover:bg-primary/80 transition-colors w-full">[ CLOSE ]</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {warning && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-lg border-2 border-destructive bg-space-navy p-6">
            <h3 className="font-pixel text-[11px] text-destructive mb-3">[ SECURITY WARNING ]</h3>
            <p className="font-mono-tech text-sm text-foreground leading-relaxed">{warning}</p>
            <button
              onClick={clearWarning}
              className="mt-5 w-full border-2 border-destructive/70 py-2 font-pixel text-[9px] text-destructive hover:bg-destructive/10 transition-colors"
            >
              [ ACKNOWLEDGE ]
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contest;
