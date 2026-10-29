import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, UserCheck, Terminal, AlertCircle } from "lucide-react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token && user) {
      if (user.role === "admin") {
        navigate("/");
      } else if (user.role === "manager") {
        navigate("/manager");
      } else {
        navigate("/developer");
      }
    }
  }, [token, user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const loggedUser = await login(email, password);

      // Role-based redirect
      if (loggedUser.role === "admin") {
        navigate("/");
      } else if (loggedUser.role === "manager") {
        navigate("/manager");
      } else {
        navigate("/developer");
      }
    } catch (error) {
      console.error("Login Error:", error);
      setErrorMessage(error.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 px-4 py-8">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white mb-3 shadow-md shadow-blue-500/20">
            D
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            DevTrack AI
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Developer Productivity & Project Intelligence
          </p>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="mb-5 flex items-start gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900">
            <AlertCircle className="mt-0.5 shrink-0" size={18} />
            <p>{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition text-sm"
            />
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition shadow-md shadow-blue-600/20 disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Demo Fast-Login Pill Buttons */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
            Quick Demo Login
          </p>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("admin@devtrack.com", "Admin@12345")}
              className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-xs font-medium text-slate-700 dark:text-slate-300 transition"
            >
              <ShieldCheck size={16} className="text-blue-600 mb-1" />
              <span>Admin</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("manager@devtrack.com", "Manager@12345")}
              className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/30 text-xs font-medium text-slate-700 dark:text-slate-300 transition"
            >
              <UserCheck size={16} className="text-violet-600 mb-1" />
              <span>Manager</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("sayali@gmail.com", "Developer@12345")}
              className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-xs font-medium text-slate-700 dark:text-slate-300 transition"
            >
              <Terminal size={16} className="text-emerald-600 mb-1" />
              <span>Developer</span>
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 transition"
          >
            Create account
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Login;