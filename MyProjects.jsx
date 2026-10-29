import { useState, useEffect } from "react";
import {
  FolderKanban,
  Users,
  CalendarDays,
  TrendingUp,
  Clock3,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function MyProjects() {
  const { token } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyProjects();
  }, [token]);

  const fetchMyProjects = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to fetch projects (Status: ${res.status})`);
      }
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err) {
      console.error("Fetch projects error:", err);
      setError(err.message || "Unable to load assigned projects. Please verify backend connection.");
    } finally {
      setLoading(false);
    }
  };

  const activeCount = projects.filter((p) => p.status === "Active").length;
  const completedCount = projects.filter((p) => p.status === "Completed").length;

  return (
    <main className="min-h-screen bg-slate-100 p-4 dark:bg-slate-950 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          My Projects
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Projects and repositories assigned to you for development and maintenance.
        </p>
      </div>

      {/* Project Statistics */}
      <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <FolderKanban className="text-blue-600" size={22} />
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Total Projects
          </p>
          <h2 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
            {loading ? "..." : projects.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <TrendingUp className="text-emerald-500" size={22} />
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Active Projects
          </p>
          <h2 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
            {loading ? "..." : activeCount}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Clock3 className="text-amber-500" size={22} />
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Completed Projects
          </p>
          <h2 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
            {loading ? "..." : completedCount}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <CalendarDays className="text-violet-500" size={22} />
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Upcoming Deadlines
          </p>
          <h2 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
            {loading ? "..." : projects.filter((p) => p.deadline).length}
          </h2>
        </div>
      </section>

      {/* Projects List */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Assigned Codebases
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Projects where you are actively assigned as a contributor
            </p>
          </div>
          <FolderKanban className="text-blue-600" size={22} />
        </div>

        {error && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchMyProjects}
              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 font-semibold text-white hover:bg-red-700 transition"
            >
              <RefreshCw size={12} />
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400">
            Loading your assigned projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-xl bg-slate-50 py-14 text-center dark:bg-slate-800/50">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <FolderKanban className="text-slate-400" size={28} />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
              No projects assigned yet
            </h3>
            <p className="mx-auto mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
              Projects assigned to you by the Project Manager will automatically appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {projects.map((project) => (
              <div
                key={project._id}
                className="rounded-xl border border-slate-200 p-5 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-base">
                      {project.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                      {project.description || "No description provided."}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0 ${
                      project.status === "Active"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                    }`}
                  >
                    {project.status}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Progress</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {project.progress || 0}% ({project.completedTasks || 0} / {project.totalTasks || 0} tasks)
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-1.5 rounded-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1">
                    <Users size={15} />
                    {Array.isArray(project.members)
                      ? `${project.members.length} Team Member${project.members.length === 1 ? "" : "s"}`
                      : `${project.members || 1} Team Members`}
                  </span>

                  <span className="flex items-center gap-1">
                    <CalendarDays size={15} />
                    Due: {project.deadline || "No deadline"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default MyProjects;