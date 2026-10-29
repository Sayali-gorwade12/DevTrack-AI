import { useState, useEffect } from "react";
import {
  Code2,
  Clock,
  TrendingUp,
  GitBranch,
  CheckCircle2,
  CalendarDays,
  Target,
  Flame,
  Loader2,
  AlertCircle,
  FolderGit2,
} from "lucide-react";
import { Link } from "react-router-dom";

function CodingProgress() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [githubStats, setGithubStats] = useState(null);
  const [githubConnected, setGithubConnected] = useState(false);

  useEffect(() => {
    const fetchProgressData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [tasksRes, actRes, ghStatusRes] = await Promise.all([
          fetch("http://localhost:5000/api/tasks", { headers }),
          fetch("http://localhost:5000/api/activity?limit=100", { headers }),
          fetch("http://localhost:5000/api/github/status", { headers }),
        ]);

        const tasksData = await tasksRes.json();
        const actData = await actRes.json();
        const ghStatusData = await ghStatusRes.json();

        if (tasksData.success) setTasks(tasksData.tasks || []);
        if (actData.success) setActivities(actData.activities || []);

        if (ghStatusData.connected) {
          setGithubConnected(true);
          const ghActRes = await fetch("http://localhost:5000/api/github/activity", { headers });
          const ghActData = await ghActRes.json();
          if (ghActData.success && ghActData.stats) {
            setGithubStats(ghActData.stats);
          }
        }
      } catch (err) {
        console.error("Error loading progress telemetry:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, []);

  // Compute metrics from real data
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;
  const inProgressTasks = tasks.filter((t) => t.status === "In Progress").length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Build weekly distribution (Monday through Sunday)
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const currentWeekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Group events by day of week
  const dayActivityCount = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
  const dayCompletedTasks = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

  // Calculate task completions per day from tasks' updatedAt or createdAt
  tasks.forEach((t) => {
    if (t.status === "Completed") {
      const date = new Date(t.updatedAt || t.createdAt);
      const dayName = daysOfWeek[date.getDay()];
      if (dayCompletedTasks[dayName] !== undefined) {
        dayCompletedTasks[dayName] += 1;
      }
    }
  });

  // Calculate activity events per day
  activities.forEach((act) => {
    const date = new Date(act.createdAt);
    const dayName = daysOfWeek[date.getDay()];
    if (dayActivityCount[dayName] !== undefined) {
      dayActivityCount[dayName] += 1;
    }
  });

  const weeklyTasks = currentWeekDays.map((day) => ({
    day,
    completed: dayCompletedTasks[day],
  }));

  const weeklyActivity = currentWeekDays.map((day) => ({
    day,
    events: dayActivityCount[day],
    // Estimated effort (0.5h per recorded action/task/review event)
    hours: Number((dayActivityCount[day] * 0.5).toFixed(1)),
  }));

  const totalWeeklyHours = Number(
    weeklyActivity.reduce((acc, curr) => acc + curr.hours, 0).toFixed(1)
  );
  const tasksCompletedThisWeek = weeklyTasks.reduce((acc, curr) => acc + curr.completed, 0);

  const maxHours = Math.max(...weeklyActivity.map((i) => i.hours), 1);
  const maxTasks = Math.max(...weeklyTasks.map((i) => i.completed), 1);

  // Real Goals
  const targetTasks = Math.max(totalTasks, 5);
  const goals = [
    {
      title: "Task Completion Target",
      current: completedTasks,
      target: targetTasks,
      unit: "tasks",
      percentage: Math.min(100, Math.round((completedTasks / targetTasks) * 100)),
    },
    {
      title: "Active Sprint Execution",
      current: inProgressTasks,
      target: Math.max(1, totalTasks - completedTasks),
      unit: "active",
      percentage: totalTasks > 0 ? Math.min(100, Math.round((inProgressTasks / (totalTasks - completedTasks || 1)) * 100)) : 0,
    },
    {
      title: "GitHub Contributions",
      current: githubConnected && githubStats ? githubStats.commits + githubStats.pullRequests : 0,
      target: 20,
      unit: "events",
      percentage: githubConnected && githubStats ? Math.min(100, Math.round(((githubStats.commits + githubStats.pullRequests) / 20) * 100)) : 0,
      isExternal: !githubConnected,
    },
  ];

  const stats = [
    {
      title: "Estimated Effort",
      value: `${totalWeeklyHours} hrs`,
      subtitle: "Based on actions & reviews",
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-100 dark:bg-blue-950",
    },
    {
      title: "Tasks Completed",
      value: `${completedTasks}`,
      subtitle: `${taskCompletionRate}% of total assigned`,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-100 dark:bg-green-950",
    },
    {
      title: "GitHub Contributions",
      value: githubConnected && githubStats ? `${githubStats.commits} commits` : "Not connected",
      subtitle: githubConnected ? "Synced via GitHub API" : "Connect account to sync",
      icon: GitBranch,
      color: "text-purple-600",
      bg: "bg-purple-100 dark:bg-purple-950",
    },
    {
      title: "Logged Actions",
      value: `${activities.length}`,
      subtitle: "Recorded platform events",
      icon: TrendingUp,
      color: "text-orange-600",
      bg: "bg-orange-100 dark:bg-orange-950",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-4 text-slate-900 dark:bg-slate-950 dark:text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold sm:text-3xl">
              <Code2 size={30} className="text-blue-600" />
              Coding Progress
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Track your real coding activity, task completion history, and development goals.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-xl bg-blue-100 px-4 py-3 text-sm font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            <CalendarDays size={19} />
            Live Telemetry Overview
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-16 text-center shadow-sm">
            <Loader2 size={36} className="animate-spin text-blue-600" />
            <p className="mt-4 font-semibold text-slate-800 dark:text-slate-200">
              Loading Progress Telemetry...
            </p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-slate-500 dark:text-slate-400">{item.title}</p>
                      <div className={`rounded-xl p-3 ${item.bg} ${item.color}`}>
                        <Icon size={22} />
                      </div>
                    </div>
                    <h2 className="mt-4 text-2xl font-bold">{item.value}</h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.subtitle}</p>
                  </div>
                );
              })}
            </div>

            {/* Weekly Activity Charts */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {/* Weekly Activity Hours */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-100 p-3 text-blue-600 dark:bg-blue-950">
                    <Clock size={22} />
                  </div>
                  <div>
                    <h2 className="font-bold">Weekly Activity Effort</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Calculated from platform interactions and code reviews
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex h-56 items-end justify-around gap-3 border-b border-slate-200 pb-2 dark:border-slate-700">
                  {weeklyActivity.map((item) => (
                    <div
                      key={item.day}
                      className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                    >
                      <span className="text-xs font-semibold">{item.hours}h</span>
                      <div
                        className="w-full max-w-10 rounded-t-lg bg-blue-600 transition-all duration-500 min-h-[4px]"
                        style={{
                          height: item.hours > 0 ? `${(item.hours / maxHours) * 65}%` : "4px",
                        }}
                        title={`${item.hours} estimated effort hours`}
                      />
                      <span className="text-xs text-slate-500 dark:text-slate-400">{item.day}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Total weekly effort</p>
                    <p className="mt-1 text-xl font-bold">{totalWeeklyHours} hours</p>
                  </div>
                  <TrendingUp className="text-blue-600" size={25} />
                </div>
              </div>

              {/* Task Completion Trend */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-green-100 p-3 text-green-600 dark:bg-green-950">
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <h2 className="font-bold">Task Completion Trend</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Tasks resolved per weekday
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex h-56 items-end justify-around gap-3 border-b border-slate-200 pb-2 dark:border-slate-700">
                  {weeklyTasks.map((item) => (
                    <div
                      key={item.day}
                      className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
                    >
                      <span className="text-xs font-semibold">{item.completed}</span>
                      <div
                        className="w-full max-w-10 rounded-t-lg bg-green-500 transition-all duration-500 min-h-[4px]"
                        style={{
                          height: item.completed > 0 ? `${(item.completed / maxTasks) * 65}%` : "4px",
                        }}
                        title={`${item.completed} completed tasks`}
                      />
                      <span className="text-xs text-slate-500 dark:text-slate-400">{item.day}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Tasks closed this week</p>
                    <p className="mt-1 text-xl font-bold">{tasksCompletedThisWeek} tasks</p>
                  </div>
                  <Target className="text-green-600" size={25} />
                </div>
              </div>
            </div>

            {/* Monthly Development Goals */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <h2 className="text-lg font-bold">Development Goals & Sprint Health</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Track your actual completion progress against platform targets.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                {goals.map((goal) => (
                  <div
                    key={goal.title}
                    className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm">{goal.title}</h3>
                        <Target size={18} className="shrink-0 text-blue-600" />
                      </div>

                      <p className="mt-4 text-2xl font-bold">
                        {goal.current}
                        <span className="text-sm font-normal text-slate-500">
                          {" "}/ {goal.target} {goal.unit}
                        </span>
                      </p>

                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all duration-500"
                          style={{ width: `${goal.percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs font-semibold text-blue-600">
                        {goal.percentage}% completed
                      </span>
                      {goal.isExternal && (
                        <Link
                          to="/developer/github"
                          className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                        >
                          Connect GitHub
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Real Progress Insights */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950/30 sm:p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-blue-600" size={25} />
                <h2 className="text-lg font-bold">Productivity Insights</h2>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl bg-white p-4 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <Flame className="mb-3 text-orange-500" size={23} />
                  <h3 className="font-semibold text-sm">Sprint Consistency</h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {completedTasks > 0
                      ? `You have resolved ${completedTasks} tasks so far. Keep regular status updates.`
                      : "Start by picking your first assigned task and marking it In Progress."}
                  </p>
                </div>

                <div className="rounded-xl bg-white p-4 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <Target className="mb-3 text-blue-600" size={23} />
                  <h3 className="font-semibold text-sm">Task Completion Ratio</h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {totalTasks > 0
                      ? `${taskCompletionRate}% of all assigned work is delivered. Keep up the velocity!`
                      : "No tasks assigned yet. Contact your project manager to receive tasks."}
                  </p>
                </div>

                <div className="rounded-xl bg-white p-4 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <FolderGit2 className="mb-3 text-purple-600" size={23} />
                  <h3 className="font-semibold text-sm">VCS Integration</h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {githubConnected
                      ? `GitHub account connected with ${githubStats?.commits || 0} commits recorded.`
                      : "Connect your GitHub account to sync commit frequency and PR activity automatically."}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-slate-400 dark:text-slate-500">
              Live developer progress computed from real MongoDB task records, activity logs, and GitHub integrations.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default CodingProgress;