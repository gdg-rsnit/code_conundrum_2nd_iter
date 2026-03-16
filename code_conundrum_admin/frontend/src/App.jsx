import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import RoundPanel from "./components/RoundPanel";
import QuestionsPanel from "./components/QuestionsPanel";
import TeamsPanel from "./components/TeamsPanel";
import UsersPanel from "./components/UsersPanel";
import ProtectedRoute from "./routes/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import UserHomePage from "./pages/UserHomePage";
import { useAuth } from "./context/AuthContext";

function PlaceholderPanel({ icon, title, subtitle }) {
  return (
    <div className="panel">
      <h2 className="panel-title">
        <span className="text-2xl">{icon}</span>
        {title}
      </h2>
      <div className="text-center py-12">
        <p className="text-6xl mb-3">{icon}</p>
        <p className="text-gray-400 mb-2">{subtitle}</p>
      </div>
    </div>
  );
}

function AdminLayout() {
  const location = useLocation();
  const { user } = useAuth();

  const pageMeta = {
    "/rounds": { icon: "🔄", title: "Round Management" },
    "/questions": { icon: "📝", title: "Questions & Answers" },
    "/teams": { icon: "👥", title: "Team Management" },
    "/users": { icon: "👤", title: "User Management" },
    "/leaderboard": { icon: "🏆", title: "Leaderboard" },
    "/monitoring": { icon: "📊", title: "Monitoring" },
  };

  const currentMeta = pageMeta[location.pathname] || { icon: "🧩", title: "Admin" };

  return (
    <div className="min-h-screen md:h-screen grid grid-rows-[64px_auto_1fr_40px] md:grid-rows-[70px_1fr_40px] grid-cols-1 md:grid-cols-[280px_1fr] bg-linear-to-br from-[#0a0a1a] via-[#0a0a2a] to-[#0a1428] text-cyan-300 font-mono overflow-hidden">
      <Header />
      <Sidebar />

      <main className="overflow-y-auto p-4 md:p-10 bg-linear-to-b from-transparent to-black/40">
        <div className="mb-5 md:mb-8 flex items-center gap-3">
          <span className="text-xl md:text-2xl">{currentMeta.icon}</span>
          <h1 className="text-2xl md:text-3xl font-black text-gradient">{currentMeta.title}</h1>
          <span className="ml-auto text-[11px] md:text-xs text-gray-400 hidden md:inline">{user?.email}</span>
        </div>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0a1428',
            color: '#67e8f9',
            border: '1px solid #22d3ee',
            fontFamily: 'monospace',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#0a1428',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#0a1428',
            },
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/user" element={<UserHomePage />} />
        </Route>

        <Route element={<ProtectedRoute requireAdmin />}>
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Navigate to="/rounds" replace />} />
            <Route path="/rounds" element={<RoundPanel />} />
            <Route path="/questions" element={<QuestionsPanel />} />
            <Route path="/teams" element={<TeamsPanel />} />
            <Route path="/users" element={<UsersPanel />} />
            <Route
              path="/leaderboard"
              element={<PlaceholderPanel icon="🏆" title="Global Leaderboard" subtitle="Connect backend leaderboard endpoint to show rankings." />}
            />
            <Route
              path="/monitoring"
              element={<PlaceholderPanel icon="📊" title="Live Monitoring Dashboard" subtitle="Connect backend monitoring endpoint and websocket stream." />}
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}