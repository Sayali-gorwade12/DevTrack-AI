import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  CheckCircle,
  Bug,
  Users,
  FolderKanban,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Reports() {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    totalBugs: 0,
    criticalBugs: 0,
    totalUsers: 0,
    developersCount: 0,
    projectCompletionRate: 0,
  });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [token]);

  const fetchReportData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [statsRes, projRes] = await Promise.all([
        fetch("http://localhost:5000/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/projects", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (statsRes.ok) {
        const sData = await statsRes.json();
        setStats(sData.stats || {});
      }
      if (projRes.ok) {
        const pData = await projRes.json();
        setProjects(pData.projects || []);
      }
    } catch (err) {
      console.error("Fetch report data error:", err);
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

  const reportCards = [
    {
      title: "Task Completion Rate",
      value: loading ? "..." : `${taskCompletionRate}%`,
      description: `${stats.completedTasks} of ${stats.totalTasks} tasks closed`,
      icon: <TrendingUp size={22} />,
    },
    {
      title: "Tasks Completed",
      value: loading ? "..." : String(stats.completedTasks),
      description: "Across all tracked projects",
      icon: <CheckCircle size={22} />,
    },
    {
      title: "Active Defect Triage",
      value: loading ? "..." : String(stats.totalBugs),
      description: `${stats.criticalBugs} critical issue(s)`,
      icon: <Bug size={22} />,
    },
    {
      title: "Engineer Allocation",
      value: loading ? "..." : `${developerActivityRate}%`,
      description: `${stats.developersCount} active developer(s)`,
      icon: <Users size={22} />,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100 p-4 dark:bg-slate-950 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            <BarChart3 size={23} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Executive Reports & Performance
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Analyze project velocity, defect density, and developer allocation from MongoDB data.
            </p>
          </div>
        </div>
      </div>

      {/* Report KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {reportCards.map((report) => (
          <div
            key={report.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {report.title}
                </p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {report.value}
                </h2>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                {report.icon}
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
              {report.description}
            </p>
          </div>
        ))}
      </div>

      {/* Project Performance Breakdown */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Project Delivery Health
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Real completion percentage calculated for each active project
            </p>
          </div>
          <FolderKanban className="text-blue-600" size={22} />
        </div>

        <div className="mt-6 space-y-6">
          {loading ? (
            <div className="py-6 text-center text-sm text-slate-400">Loading project analytics...</div>
          ) : projects.length === 0 ? (
            <div className="py-6 text-center text-sm text-slate-400">No active projects to analyze.</div>
          ) : (
            projects.map((proj) => (
              <div key={proj._id}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {proj.name}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {proj.progress || 0}% ({proj.completedTasks || 0}/{proj.totalTasks || 0} tasks completed)
                  </span>
                </div>

                <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className="h-3 rounded-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${proj.progress || 0}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Developer Capacity */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Platform Resource Allocation
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Distribution of platform roles and work items
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
            <p className="text-sm text-slate-500 dark:text-slate-400">Active Engineers</p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {stats.developersCount}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Work Items</p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {stats.totalTasks + stats.totalBugs}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
            <p className="text-sm text-slate-500 dark:text-slate-400">Platform Users</p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {stats.totalUsers}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Reports;