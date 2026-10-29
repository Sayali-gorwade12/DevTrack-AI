import { useState, useEffect } from "react";
import {
  Users,
  FolderKanban,
  UserCog,
  Bug,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";

function AdminDashboard() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    totalTeams: 0,
    totalTasks: 0,
    totalBugs: 0,
    completedTasks: 0,
    pendingTasks: 0,
    criticalBugs: 0,
    developersCount: 0,
    projectCompletionRate: 0,
  });

  useEffect(() => {
    fetchStats();
  }, [token]);

  const fetchStats = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Admin stats fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const taskCompletionRate =
    stats.totalTasks > 0
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0;

  const developerActivityRate =
    stats.totalUsers > 0
      ? Math.round((stats.developersCount / stats.totalUsers) * 100)
      : 0;

  return (
    <main className="min-h-screen bg-slate-100 p-4 dark:bg-slate-950 sm:p-6 lg:p-8">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          Dashboard Overview
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Monitor your platform, projects, and developer activity with real MongoDB data.
        </p>
      </div>

      {/* Statistics */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Users"
          value={loading ? "..." : String(stats.totalUsers)}
          icon={<Users size={22} />}
          trend="Real-time"
          description="Registered accounts"
        />

        <StatCard
          title="Active Projects"
          value={loading ? "..." : String(stats.totalProjects)}
          icon={<FolderKanban size={22} />}
          trend="MongoDB"
          description="Tracked projects"
        />

        <StatCard
          title="Developers"
          value={loading ? "..." : String(stats.developersCount)}
          icon={<UserCog size={22} />}
          trend="Verified"
          description="Active engineers"
        />

        <StatCard
          title="Open Bugs"
          value={loading ? "..." : String(stats.totalBugs)}
          icon={<Bug size={22} />}
          trend={stats.criticalBugs > 0 ? `${stats.criticalBugs} Critical` : "Healthy"}
          trendType={stats.criticalBugs > 0 ? "negative" : "positive"}
          description="In issue triage"
        />
      </section>

      {/* Platform Summary */}
      <section className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Project Progress */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Platform Performance
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Overall platform completion ratios calculated from real records
              </p>
            </div>
            <TrendingUp className="text-emerald-500" size={22} />
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">
                  Project Delivery Rate
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {stats.projectCompletionRate}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-2 rounded-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${stats.projectCompletionRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">
                  Task Completion Rate
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {taskCompletionRate}% ({stats.completedTasks} of {stats.totalTasks} completed)
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-2 rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${taskCompletionRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-300">
                  Developer Allocation
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {developerActivityRate}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-2 rounded-full bg-violet-500 transition-all duration-500"
                  style={{ width: `${developerActivityRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Live Metrics Summary
          </h2>

          <div className="mt-5 space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-emerald-500 shrink-0" size={20} />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Completed Tasks
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {stats.completedTasks} tasks closed out
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="text-amber-500 shrink-0" size={20} />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Pending Tasks
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {stats.pendingTasks} tasks in progress or pending
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <AlertTriangle className="text-red-500 shrink-0" size={20} />
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Critical Bugs
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {stats.criticalBugs} critical defect(s) detected
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AdminDashboard;