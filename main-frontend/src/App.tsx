import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
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

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const hideNavbarRoutes = ['/contest', '/round-complete', '/countdown', '/banned'];
  const showNavbar = !hideNavbarRoutes.includes(location.pathname);

  const teamRaw = localStorage.getItem('cc_team');
  const team = teamRaw ? JSON.parse(teamRaw) : null;
  const isBanned = Boolean(team?.banned || team?.team?.banned);

  if (isBanned && location.pathname !== '/banned') {
    return <Navigate to="/banned" replace />;
  }

  return (
    <>
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
    </>
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
