import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useLogin } from "../hooks/authHook";

const DEFAULT_SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

const getSessionDurationMs = () => {
  const parsed = Number(import.meta.env.VITE_AUTH_SESSION_MS);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  return DEFAULT_SESSION_DURATION_MS;
};

export default function LoginPage() {
  const [mode, setMode] = useState("ADMIN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLogin();
  const sessionDurationMs = getSessionDurationMs();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (event) => {
    event.preventDefault();

    const loadingToast = toast.loading("Logging in...");

    try {
      const response = await loginMutation.mutateAsync({ email, password });
      const loggedInUser = response?.user;

      if (!loggedInUser?.role) {
        throw new Error("Invalid login response");
      }

      if (mode === "ADMIN" && loggedInUser.role !== "ADMIN") {
        throw new Error("This account is not an admin account");
      }

      if (mode === "USER" && loggedInUser.role === "ADMIN") {
        throw new Error("Use Admin mode for this account");
      }

      // Persist UI auth state with a configurable TTL.
      const authData = {
        user: loggedInUser,
        expiresAt: Date.now() + sessionDurationMs
      };
      
      setUser(loggedInUser);
      localStorage.setItem("cc_auth_user", JSON.stringify(authData));

      toast.success(`Welcome back, ${loggedInUser.email}!`, { id: loadingToast });

      if (loggedInUser.role === "ADMIN") {
        navigate(from && from !== "/login" ? from : "/rounds", { replace: true });
      } else {
        navigate("/user", { replace: true });
      }
    } catch (err) {
      toast.error(err.message || "Unable to login. Please try again.", { id: loadingToast });
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0a0a1a] via-[#0a0a2a] to-[#0a1428] text-cyan-300 font-mono flex items-center justify-center p-4">
      <div className="w-full max-w-md panel mb-0">
        <h1 className="panel-title justify-center">🔐 Login</h1>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setMode("ADMIN")}
            className={`flex-1 btn ${mode === "ADMIN" ? "btn-cyan bg-cyan-400 text-black" : "btn-cyan"}`}
          >
            Admin Login
          </button>
          <button
            type="button"
            onClick={() => setMode("USER")}
            className={`flex-1 btn ${mode === "USER" ? "btn-green bg-green-400 text-black" : "btn-green"}`}
          >
            User Login
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <button type="submit" className="w-full btn btn-cyan" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Logging in..." : `Login as ${mode === "ADMIN" ? "Admin" : "User"}`}
          </button>
        </form>
      </div>
    </div>
  );
}
