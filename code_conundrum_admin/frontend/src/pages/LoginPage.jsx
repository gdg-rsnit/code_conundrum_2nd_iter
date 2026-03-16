import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLogin } from "../hooks/authHook";

export default function LoginPage() {
  const [mode, setMode] = useState("ADMIN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLogin();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

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

      setUser(loggedInUser);
      localStorage.setItem("cc_auth_user", JSON.stringify(loggedInUser));

      if (loggedInUser.role === "ADMIN") {
        navigate(from && from !== "/login" ? from : "/rounds", { replace: true });
      } else {
        navigate("/user", { replace: true });
      }
    } catch (err) {
      setError(err.message || "Unable to login");
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

          {error ? <p className="text-xs text-red-400">{error}</p> : null}

          <button type="submit" className="w-full btn btn-cyan" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Logging in..." : `Login as ${mode === "ADMIN" ? "Admin" : "User"}`}
          </button>
        </form>
      </div>
    </div>
  );
}
