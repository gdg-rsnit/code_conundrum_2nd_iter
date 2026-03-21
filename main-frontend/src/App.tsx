import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Index from "./pages/Index";
import Intro from "./pages/Intro";
import WaitingRoom from "./pages/WaitingRoom";
import Contest from "./pages/Contest";
import Leaderboard from "./pages/Leaderboard";
import Rules from "./pages/Rules";
import Register from "./pages/Register";
import RoundComplete from "./pages/RoundComplete";
import Countdown from "./pages/Countdown";
import Banned from "./pages/Banned";
import NotFound from "./pages/NotFound";

import FullscreenEnforcer from "@/components/FullscreenEnforcer";
import { handleUnauthorized } from "@/lib/authSession";

const queryClient = new QueryClient();
const API_URL = 'http://localhost:5000/api';

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const hideNavbarRoutes = ['/contest', '/round-complete', '/countdown', '/banned'];
  const showNavbar = !hideNavbarRoutes.includes(location.pathname);

  useEffect(() => {
    const hasLocalAuth = Boolean(
      localStorage.getItem('cc_user') ||
      localStorage.getItem('cc_team') ||
      localStorage.getItem('userId')
    );

    if (!hasLocalAuth) {
      return;
    }

    let cancelled = false;

    const validateSession = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/round`, {
          credentials: 'include',
        });

        if (!cancelled && response.status === 401) {
          handleUnauthorized(navigate, '/home');
        }
      } catch {
        // Ignore transient network errors; keep current local state.
      }
    };

    void validateSession();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, navigate]);

  const teamRaw = localStorage.getItem('cc_team');
  const team = teamRaw ? JSON.parse(teamRaw) : null;
  const isBanned = Boolean(team?.banned || team?.team?.banned);

  if (isBanned && location.pathname !== '/banned') {
    return <Navigate to="/banned" replace />;
  }

  return (
    <FullscreenEnforcer>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Intro />} />
        <Route path="/home" element={<Index />} />
        <Route path="/waiting-room" element={<WaitingRoom />} />
        <Route path="/contest" element={<Contest />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/register" element={<Register />} />
        <Route path="/round-complete" element={<RoundComplete />} />
        <Route path="/countdown" element={<Countdown />} />
        <Route path="/banned" element={<Banned />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </FullscreenEnforcer>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
