import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function UserHomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const loadingToast = toast.loading("Logging out...");
    try {
      await logout();
      toast.success("Logged out successfully!", { id: loadingToast });
      navigate("/login");
    } catch (error) {
      toast.error("Failed to logout", { id: loadingToast });
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0a0a1a] via-[#0a0a2a] to-[#0a1428] text-cyan-300 font-mono p-4 md:p-10">
      <div className="panel">
        <h2 className="panel-title">👋 User Home</h2>
        <p className="text-sm md:text-base text-cyan-200">Welcome {user?.email}</p>
        <p className="text-xs text-gray-400 mt-2">You are logged in as USER. Admin routes are protected.</p>
        
        <button 
          onClick={handleLogout}
          className="mt-4 btn btn-cyan"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
