import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FolderKanban,
  CheckSquare,
  Bug,
  Flame,
  GitBranch,
  Code2,
  Brain,
  TrendingUp,
  Clock3,
  Clock,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function DeveloperDashboard() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    fetchDeveloperData();
  }, [token]);

  const fetchDeveloperData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [projRes, taskRes, bugRes, aiRes] = await Promise.all([
        fetch("http://localhost:5000/api/projects", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:5000/api/tasks", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:5000/api/bugs", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:5000/api/ai/insights", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const [pData, tData, bData, aData] = await Promise.all([
        projRes.json(),
        taskRes.json(),
        bugRes.json(),
        aiRes.json(),
      ]);

      setProjects(pData.projects || []);
      setTasks(tData.tasks || []);
      setBugs(bData.bugs || []);
      if (aData.success) {
        setInsights(aData);
      }
    } catch (err) {
      console.error("Developer Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const completedTasks = tasks.filter((t) => t.status === "Completed");
  const pendingTasks = tasks.filter((t) => t.status !== "Completed");
  const openBugs = bugs.filter((b) => b.status !== "Resolved");
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
  const devTrackScore = insights?.devTrackScore || (tasks.length > 0 ? Math.min(95, 60 + completionRate * 0.35) : 80);

  return (
    <main className="min-h-screen bg-slate-100 p-4 dark:bg-slate-950 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Developer Workspace
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Welcome back, {user?.name || "Developer"}. Here is your live productivity overview.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/developer/code-review"
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <Code2 size={18} />
            AI Code Review
          </Link>
          <Link
            to="/developer/tasks"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <CheckSquare size={18} />
            My Tasks
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {/* Assigned Projects */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30">
              <FolderKanban size={22} />
            </div>
            <span className="text-xs text-slate-400">Active</span>
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Assigned Projects
          </p>
          <h2 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
            {loading ? "..." : projects.length}
          </h2>
        </div>

        {/* Pending Tasks */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
              <CheckSquare size={22} />
            </div>
            <span className="text-xs text-emerald-500 font-semibold">{completionRate}% Done</span>
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Pending Tasks
          </p>
          <h2 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
            {loading ? "..." : pendingTasks.length}
          </h2>
        </div>

        {/* Open Bugs */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30">
              <Bug size={22} />
            </div>
            <span className="text-xs text-slate-400">Assigned / Reported</span>
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Open Bugs
          </p>
          <h2 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
            {loading ? "..." : openBugs.length}
          </h2>
        </div>

        {/* Coding Streak */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-500 dark:bg-orange-900/30">
              <Flame size={22} />
            </div>
            <span className="text-xs text-orange-500 font-semibold">Active Streak</span>
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Coding Consistency
          </p>
          <h2 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
            {loading ? "..." : "7 Days"}
          </h2>
        </div>
      </section>

      {/* Main Grid */}
      <section className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* My Tasks */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                My Assigned Tasks
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tasks allocated to you by your Project Manager
              </p>
            </div>
            <Link
              to="/developer/tasks"
              className="text-xs font-semibold text-blue-600 hover:text-blue-500 flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-slate-400">Loading your tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="rounded-xl bg-slate-50 py-10 text-center dark:bg-slate-800/50">
              <CheckSquare className="mx-auto mb-3 text-slate-400" size={30} />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                No tasks assigned yet
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Tasks assigned by your Project Manager will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.slice(0, 4).map((task) => (
                <div
                  key={task._id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 p-3.5 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition"
                >
                  <div className="min-w-0 pr-3">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                      {task.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {task.project} • Due: {task.deadline || "Soon"}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                      task.status === "Completed"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : task.status === "In Progress"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DevTrack Score */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  DevTrack Score
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Engineering health & delivery score
                </p>
              </div>
              <TrendingUp className="text-emerald-500" size={22} />
            </div>

            <div className="my-6 flex justify-center">
              <div className="flex h-32 w-32 items-center justify-center rounded-full border-8 border-blue-600 shadow-md shadow-blue-500/20">
                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {loading ? "--" : devTrackScore}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    / 100
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 text-center text-xs text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
            {completionRate >= 70
              ? "Strong progress! Keep resolving assigned tasks to maintain momentum."
              : "Complete pending tasks to increase your productivity score."}
          </div>
        </div>

        {/* My Projects */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                My Projects
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Authorized repositories & codebases
              </p>
            </div>
            <FolderKanban className="text-blue-600" size={20} />
          </div>

          {loading ? (
            <div className="py-8 text-center text-sm text-slate-400">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="rounded-xl bg-slate-50 py-8 text-center dark:bg-slate-800/50">
              <FolderKanban className="mx-auto mb-2 text-slate-400" size={24} />
              <p className="text-xs text-slate-500">No projects assigned yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((proj) => (
                <div
                  key={proj._id}
                  className="rounded-xl border border-slate-100 p-3 dark:border-slate-800"
                >
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-slate-900 dark:text-white text-xs truncate">
                      {proj.name}
                    </p>
                    <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                      {proj.progress || 0}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-1.5 rounded-full bg-blue-600"
                      style={{ width: `${proj.progress || 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Coding Progress */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Task Velocity & Completion
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tracked from actual project deliverables
              </p>
            </div>
            <GitBranch className="text-violet-500" size={22} />
          </div>

          <div className="space-y-5">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">
                  Tasks Completed Ratio
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {completionRate}% ({completedTasks.length} / {tasks.length})
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-2 rounded-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">
                  Bugs Resolved Ratio
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {bugs.length > 0 ? Math.round(((bugs.length - openBugs.length) / bugs.length) * 100) : 100}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-2 rounded-full bg-emerald-500 transition-all duration-500"
                  style={{
                    width: `${bugs.length > 0 ? Math.round(((bugs.length - openBugs.length) / bugs.length) * 100) : 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights Banner */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900/30">
                <Brain size={22} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Gemini AI Personalized Insights
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Generated from your real task and defect telemetry
                </p>
              </div>
            </div>

            <Link
              to="/developer/insights"
              className="text-xs font-semibold text-violet-600 hover:text-violet-500 flex items-center gap-1"
            >
              Full Insights <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
              <div className="flex items-start gap-3">
                <Clock3 className="text-amber-500 shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Delivery Focus
                  </p>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {insights?.insights?.[0]?.description ||
                      `You have ${pendingTasks.length} pending task(s) and ${openBugs.length} open defect(s). Prioritize high-priority work items.`}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
              <div className="flex items-start gap-3">
                <Code2 className="text-blue-500 shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Code Quality Suggestion
                  </p>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {insights?.recommendations?.[0] ||
                      "Submit code to AI Code Review to identify security flaws and performance optimizations."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default DeveloperDashboard;