import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FolderKanban,
  CheckSquare,
  Bug,
  UsersRound,
  TrendingUp,
  AlertTriangle,
  Clock,
  Plus,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function ManagerDashboard() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    criticalBugs: 0,
    openBugs: 0,
    totalTeams: 0,
  });
  const [projects, setProjects] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [projRes, taskRes, bugRes, teamRes] = await Promise.all([
        fetch("http://localhost:5000/api/projects", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/tasks", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/bugs", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/teams", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const [projData, taskData, bugData, teamData] = await Promise.all([
        projRes.json(),
        taskRes.json(),
        bugRes.json(),
        teamRes.json(),
      ]);

      const projs = projData.projects || [];
      const tasks = taskData.tasks || [];
      const bugs = bugData.bugs || [];
      const teams = teamData.teams || [];

      const completed = tasks.filter((t) => t.status === "Completed").length;
      const pending = tasks.filter((t) => t.status !== "Completed").length;
      const critical = bugs.filter((b) => b.severity === "Critical" && b.status !== "Resolved").length;
      const open = bugs.filter((b) => b.status !== "Resolved").length;
      const reviewsAwaiting = tasks.filter(
        (t) => t.status === "Submitted for Review" || (t.submission && t.submission.reviewStatus === "Pending Review")
      );

      setProjects(projs);
      setRecentTasks(tasks.slice(0, 5));
      setPendingReviews(reviewsAwaiting);
      setStats({
        activeProjects: projs.filter((p) => p.status === "Active").length,
        totalTasks: tasks.length,
        completedTasks: completed,
        pendingTasks: pending,
        criticalBugs: critical,
        openBugs: open,
        totalTeams: teams.length,
      });
    } catch (err) {
      console.error("Manager Dashboard Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const overallProgress =
    stats.totalTasks > 0
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0;

  // Project Risk Detection Rule:
  // If open bugs > 2 OR critical bugs > 0 -> "High Risk"
  // Else if pending tasks > completed tasks -> "Moderate Risk"
  // Else -> "Healthy"
  const getRiskStatus = () => {
    if (stats.criticalBugs > 0 || stats.openBugs >= 3) {
      return { level: "High Risk", color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900", desc: `${stats.criticalBugs} critical and ${stats.openBugs} open bugs require immediate triage.` };
    }
    if (stats.pendingTasks > stats.completedTasks) {
      return { level: "Moderate Risk", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900", desc: "Pending tasks currently outpace completions. Review upcoming deadlines." };
    }
    return { level: "Healthy", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900", desc: "All projects are progressing smoothly with low defect density." };
  };

  const risk = getRiskStatus();

  return (
    <main className="min-h-screen bg-slate-100 p-4 dark:bg-slate-950 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Project Manager Overview
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Real-time delivery progress, risk detection, and team allocation
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/manager/projects"
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-600/20 transition hover:bg-violet-700"
          >
            <Plus size={18} />
            New Project
          </Link>
          <Link
            to="/manager/tasks"
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <CheckSquare size={18} />
            Assign Task
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {/* Active Projects */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
              <FolderKanban size={22} />
            </div>
            <span className="text-xs text-slate-400">Projects</span>
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Active Projects
          </p>
          <h2 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
            {loading ? "..." : stats.activeProjects}
          </h2>
        </div>

        {/* Task Completion Rate */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <CheckSquare size={22} />
            </div>
            <span className="text-xs text-emerald-500 font-semibold">{overallProgress}%</span>
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Completed Tasks
          </p>
          <h2 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
            {loading ? "..." : `${stats.completedTasks} / ${stats.totalTasks}`}
          </h2>
        </div>

        {/* Open Defect Density */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
              <Bug size={22} />
            </div>
            {stats.criticalBugs > 0 && (
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-semibold text-red-700 dark:bg-red-950 dark:text-red-400">
                {stats.criticalBugs} Critical
              </span>
            )}
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Open Bugs
          </p>
          <h2 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
            {loading ? "..." : stats.openBugs}
          </h2>
        </div>

        {/* Teams Under Management */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <UsersRound size={22} />
            </div>
            <span className="text-xs text-slate-400">Teams</span>
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Active Teams
          </p>
          <h2 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
            {loading ? "..." : stats.totalTeams}
          </h2>
        </div>
      </section>

      {/* Risk Alert Banner */}
      <section className="mt-8">
        <div className={`rounded-2xl border p-5 shadow-sm ${risk.bg}`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <ShieldAlert className={risk.color} size={28} />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    Project Risk Assessment:
                  </h3>
                  <span className={`font-semibold ${risk.color}`}>
                    {risk.level}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  {risk.desc}
                </p>
              </div>
            </div>

            <Link
              to="/manager/bugs"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:underline"
            >
              <span>Review Issues</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Submissions Awaiting Manager Review */}
      {pendingReviews.length > 0 && (
        <section className="mt-8">
          <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-5 shadow-sm dark:border-violet-900/40 dark:bg-violet-950/20">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm">
                  <Clock size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Submissions Awaiting Review ({pendingReviews.length})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Developers have submitted completed work items ready for code inspection and approval.
                  </p>
                </div>
              </div>
              <Link
                to="/manager/tasks"
                className="flex items-center gap-1.5 text-xs font-semibold text-violet-700 dark:text-violet-400 hover:underline"
              >
                <span>View All In Tasks</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {pendingReviews.map((task) => (
                <div
                  key={task._id}
                  className="rounded-xl border border-violet-100 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="font-medium text-slate-500">{task.project}</span>
                      <span className="text-violet-600 font-semibold">Needs Review</span>
                    </div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-xs line-clamp-1">
                      {task.title}
                    </h4>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                      By: <strong className="text-slate-700 dark:text-slate-300">{task.developer}</strong>
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {task.submission?.submittedAt
                        ? new Date(task.submission.submittedAt).toLocaleDateString()
                        : "Recently"}
                    </span>
                    <Link
                      to="/manager/tasks"
                      className="rounded-lg bg-violet-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-violet-700 transition shadow-sm"
                    >
                      Review Work
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Grid */}
      <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Managed Projects List */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Project Progress & Delivery
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Calculated directly from MongoDB task completions
              </p>
            </div>
            <Link
              to="/manager/projects"
              className="text-xs font-semibold text-violet-600 hover:text-violet-500 dark:text-violet-400 flex items-center gap-1"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-slate-400">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              No projects created yet. Click "New Project" above to create one.
            </div>
          ) : (
            <div className="space-y-5">
              {projects.map((proj) => (
                <div
                  key={proj._id}
                  className="rounded-xl border border-slate-100 p-4 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {proj.name}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {proj.description || "No description provided."}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        proj.status === "Active"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                      }`}
                    >
                      {proj.status}
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-500">Progress</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {proj.progress || 0}% ({proj.completedTasks || 0}/{proj.totalTasks || 0} tasks)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-2 rounded-full bg-violet-600 transition-all duration-500"
                        style={{ width: `${proj.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-1">
                      <Clock size={13} />
                      Due: {proj.deadline || "No deadline"}
                    </span>
                    <span>{proj.openBugs || 0} open bug(s)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Tasks Column */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Recent Tasks
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest updates across assigned developers
              </p>
            </div>
            <Link
              to="/manager/tasks"
              className="text-xs font-semibold text-violet-600 hover:text-violet-500 dark:text-violet-400 flex items-center gap-1"
            >
              All Tasks <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-slate-400">Loading tasks...</div>
          ) : recentTasks.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">No tasks created yet.</div>
          ) : (
            <div className="space-y-3.5">
              {recentTasks.map((task) => (
                <div
                  key={task._id}
                  className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/60"
                >
                  <p className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                    {task.title}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{task.developer || "Unassigned"}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 font-medium ${
                        task.status === "Completed"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                          : task.status === "Submitted for Review"
                            ? "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400"
                            : task.status === "Changes Requested"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                              : task.status === "In Progress"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                                : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default ManagerDashboard;
