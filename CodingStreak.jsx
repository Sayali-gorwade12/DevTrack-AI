import { useState, useEffect } from "react";
import {
  Flame,
  CalendarDays,
  Target,
  Trophy,
  CheckCircle2,
  TrendingUp,
  Star,
  Loader2,
  Activity,
} from "lucide-react";

function CodingStreak() {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchStreakData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/activity?limit=250", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setActivities(data.activities || []);
        }
      } catch (err) {
        console.error("Error loading streak data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStreakData();
  }, []);

  // Compute unique active calendar dates (YYYY-MM-DD in local time)
  const getLocalDateStr = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const activeDates = new Set();
  const dateCounts = {};

  activities.forEach((act) => {
    const date = new Date(act.createdAt);
    const dateStr = getLocalDateStr(date);
    activeDates.add(dateStr);
    dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
  });

  const now = new Date();
  const todayStr = getLocalDateStr(now);

  // Compute Current Streak
  let currentStreak = 0;
  let check = new Date(now);
  let checkStr = getLocalDateStr(check);

  // If active today, count today and go backwards
  if (activeDates.has(checkStr)) {
    while (activeDates.has(checkStr)) {
      currentStreak++;
      check.setDate(check.getDate() - 1);
      checkStr = getLocalDateStr(check);
    }
  } else {
    // If not active yet today, check if streak was active yesterday
    check.setDate(check.getDate() - 1);
    checkStr = getLocalDateStr(check);
    while (activeDates.has(checkStr)) {
      currentStreak++;
      check.setDate(check.getDate() - 1);
      checkStr = getLocalDateStr(check);
    }
  }

  // Compute Longest Streak
  const sortedDates = Array.from(activeDates).sort();
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate = null;

  for (const dStr of sortedDates) {
    const curr = new Date(dStr);
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffDays = Math.round((curr - prevDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    prevDate = curr;
  }
  longestStreak = Math.max(longestStreak, currentStreak);

  const activeDays = activeDates.size;

  // Daily target (3 platform actions: commits, reviews, task updates)
  const todayActions = dateCounts[todayStr] || 0;
  const dailyTarget = 3;
  const goalPercentage = Math.min(100, Math.round((todayActions / dailyTarget) * 100));

  // Compute Current Week (Monday through Sunday)
  const dayIndex = (now.getDay() + 6) % 7; // 0 for Mon, 6 for Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayIndex);

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekDays = dayNames.map((name, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dStr = getLocalDateStr(d);
    return {
      day: name,
      date: d.getDate(),
      completed: activeDates.has(dStr),
      isToday: dStr === todayStr,
    };
  });

  // Generate 35-day activity grid ending today
  const calendarDays = [];
  for (let i = 34; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dStr = getLocalDateStr(d);
    calendarDays.push({
      dateStr: dStr,
      dayNum: d.getDate(),
      active: activeDates.has(dStr),
      count: dateCounts[dStr] || 0,
      isToday: dStr === todayStr,
    });
  }

  const milestones = [
    {
      title: "3-Day Streak",
      description: "Perform daily actions for 3 consecutive days",
      target: 3,
      icon: Flame,
    },
    {
      title: "7-Day Streak",
      description: "Maintain a full week of continuous activity",
      target: 7,
      icon: Star,
    },
    {
      title: "14-Day Streak",
      description: "Establish a resilient two-week coding habit",
      target: 14,
      icon: Trophy,
    },
    {
      title: "30-Day Streak",
      description: "Achieve the elite month-long consistency badge",
      target: 30,
      icon: Target,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-4 text-slate-900 dark:bg-slate-950 dark:text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold sm:text-3xl">
              <Flame size={30} className="text-orange-500" />
              Coding Streak
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Build developer consistency and keep your streak active with real daily actions.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-xl bg-orange-100 px-4 py-3 text-sm font-semibold text-orange-700 dark:bg-orange-950 dark:text-orange-300">
            <Flame size={20} />
            {currentStreak > 0 ? `${currentStreak} Day Streak Active!` : "Start Your Streak Today"}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-16 text-center shadow-sm">
            <Loader2 size={36} className="animate-spin text-orange-500" />
            <p className="mt-4 font-semibold text-slate-800 dark:text-slate-200">
              Calculating Consistency Telemetry...
            </p>
          </div>
        ) : (
          <>
            {/* Streak Summary */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm dark:border-orange-900 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Current Streak</p>
                  <Flame className="text-orange-500" size={25} />
                </div>
                <h2 className="mt-4 text-3xl font-bold">{currentStreak} Days</h2>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  {currentStreak > 0 ? "Consecutive active days" : "Log an action today to start"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Longest Streak</p>
                  <Trophy className="text-amber-500" size={25} />
                </div>
                <h2 className="mt-4 text-3xl font-bold">{longestStreak} Days</h2>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Personal best recorded</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Active Days</p>
                  <CalendarDays className="text-blue-600" size={25} />
                </div>
                <h2 className="mt-4 text-3xl font-bold">{activeDays} Days</h2>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Total days with activity</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Today's Target</p>
                  <Target className="text-green-600" size={25} />
                </div>
                <h2 className="mt-4 text-3xl font-bold">
                  {todayActions} / {dailyTarget}
                </h2>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Platform actions completed</p>
              </div>
            </div>

            {/* Main Section */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              {/* Weekly Streak */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-2 sm:p-6">
                <h2 className="text-lg font-bold">This Week's Activity Track</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Live status for the current Monday to Sunday cycle
                </p>

                <div className="mt-7 grid grid-cols-7 gap-2 sm:gap-4">
                  {weekDays.map((item) => (
                    <div key={item.day} className="flex flex-col items-center gap-3">
                      <span className="text-xs text-slate-500 dark:text-slate-400">{item.day}</span>

                      <div
                        className={`flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-full transition-all ${
                          item.completed
                            ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                            : item.isToday
                            ? "border-2 border-dashed border-orange-400 text-orange-500 bg-orange-50 dark:bg-orange-950/20"
                            : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                        }`}
                      >
                        {item.completed ? <Flame size={24} /> : <span className="text-xs">{item.date}</span>}
                      </div>

                      <span className={`text-[11px] font-medium ${item.isToday ? "text-orange-600 font-bold" : ""}`}>
                        {item.isToday ? "Today" : item.date}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-7 flex items-start gap-3 rounded-xl bg-orange-50 p-4 dark:bg-orange-950/40">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-orange-600" size={22} />
                  <div>
                    <h3 className="font-semibold text-sm">
                      {currentStreak >= 3 ? "Impressive Momentum!" : "Consistency in Action"}
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                      {currentStreak > 0
                        ? `You have maintained an active streak of ${currentStreak} consecutive day(s). Perform code reviews or update task progress daily to keep it running!`
                        : "No activity recorded yet for today or yesterday. Submit a code review, report a bug, or update a task status to ignite your streak!"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Today's Target Gauge */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-bold">Daily Activity Goal</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Target: 3 platform events / day
                  </p>
                </div>

                <div className="my-6 flex justify-center">
                  <div className="flex h-36 w-36 items-center justify-center rounded-full border-[10px] border-orange-500 shadow-inner">
                    <div className="text-center">
                      <p className="text-3xl font-bold">{goalPercentage}%</p>
                      <p className="text-xs text-slate-500">Achieved</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Actions Today</span>
                    <span className="font-semibold">{todayActions} actions</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Remaining</span>
                    <span className="font-semibold">{Math.max(0, dailyTarget - todayActions)} actions</span>
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-slate-50 p-3.5 dark:bg-slate-950 text-center">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {todayActions >= dailyTarget
                      ? "Daily goal reached! Great job."
                      : `${dailyTarget - todayActions} more action(s) needed today.`}
                  </p>
                </div>
              </div>
            </div>

            {/* 35-Day Activity Grid */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <div className="flex items-center gap-3">
                <CalendarDays className="text-blue-600" size={24} />
                <div>
                  <h2 className="text-lg font-bold">35-Day Consistency Heatmap</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Actual calendar days showing recorded developer events
                  </p>
                </div>
              </div>

              <div className="mt-6 overflow-x-auto pb-2">
                <div className="grid min-w-[500px] grid-cols-7 gap-2">
                  {calendarDays.map((item, idx) => (
                    <div
                      key={idx}
                      title={`${item.dateStr}: ${item.count} activity records`}
                      className={`flex h-11 flex-col items-center justify-center rounded-lg text-xs font-semibold transition ${
                        item.active
                          ? item.count >= 3
                            ? "bg-orange-500 text-white shadow-sm"
                            : "bg-orange-300 text-slate-900"
                          : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                      } ${item.isToday ? "ring-2 ring-blue-600 ring-offset-2" : ""}`}
                    >
                      <span>{item.dayNum}</span>
                      {item.active && <span className="text-[9px] opacity-80">{item.count}</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>No actions</span>
                <span className="h-3 w-3 rounded-sm bg-slate-100 dark:bg-slate-800" />
                <span className="h-3 w-3 rounded-sm bg-orange-300" />
                <span className="h-3 w-3 rounded-sm bg-orange-500" />
                <span>Active (3+ actions)</span>
              </div>
            </div>

            {/* Streak Milestones */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <h2 className="text-lg font-bold">Consistency Milestones</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Track and unlock achievements based on your real longest streak.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {milestones.map((item) => {
                  const Icon = item.icon;
                  const achieved = longestStreak >= item.target;

                  return (
                    <div
                      key={item.title}
                      className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 flex flex-col justify-between"
                    >
                      <div>
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                            achieved
                              ? "bg-orange-100 text-orange-600 dark:bg-orange-950"
                              : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                          }`}
                        >
                          <Icon size={23} />
                        </div>

                        <h3 className="mt-4 font-semibold">{item.title}</h3>
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 min-h-8">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-4">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                            achieved
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                          }`}
                        >
                          {achieved ? "Achieved" : `${longestStreak}/${item.target} Days`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-center text-xs text-slate-400 dark:text-slate-500">
              Live consistency streaks calculated strictly from dated activity log records in MongoDB.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default CodingStreak;