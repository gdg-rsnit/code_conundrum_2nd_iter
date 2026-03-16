import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, logout } = useAuth();

  const handleAuthClick = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    await logout();
    navigate("/login");
  };

  return (
    <header className="col-span-1 md:col-span-2 flex items-center justify-between px-4 md:px-10 bg-linear-to-r from-[#000a1e]/95 to-[#001a3e]/95 border-b-2 border-cyan-400 backdrop-blur-md shadow-lg shadow-cyan-400/10">
      <div className="flex items-center gap-2 md:gap-3">
        <span className="text-xl md:text-2xl">💻</span>
        <h1 className="text-lg md:text-2xl font-black tracking-wide md:tracking-widest bg-linear-to-r from-cyan-400 to-sky-500 bg-clip-text text-transparent">
          CODE CONUNDRUM
        </h1>
      </div>
      
      <div className="flex items-center gap-3 md:gap-6">
        <div className="hidden md:flex items-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-lg">🟢</span>
            <span className="text-cyan-300">SYSTEM ONLINE</span>
          </div>
          <div className="border-l border-cyan-400/30 pl-8">
            <div className="text-xs text-gray-400 mb-1">Current Round</div>
            <span className="font-bold text-cyan-300">ROUND 2 LIVE</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAuthClick}
          className="px-3 md:px-4 py-1.5 md:py-2 text-[11px] md:text-xs font-bold uppercase rounded border border-cyan-400 text-cyan-300 hover:bg-cyan-400 hover:text-black transition-all duration-200"
        >
          {isAuthenticated ? "Logout" : "Login"} {isAuthenticated ? (isAdmin ? "(Admin)" : "(User)") : ""}
        </button>
      </div>
    </header>
  );
}