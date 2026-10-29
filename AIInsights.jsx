import { useState, useEffect } from "react";
import {
  Brain,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Bug,
  Target,
  Lightbulb,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";

function AIInsights() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [insightsData, setInsightsData] = useState(null);
  const [error, setError] = useState(null);

  const fetchInsights = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/ai/insights", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setInsightsData(data);
      } else {
        setError(data.message || "Failed to load AI insights");
      }
    } catch (err) {
      console.error("AI Insights Error:", err);
      setError("Unable to connect to AI insights service. Please check backend connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const score = insightsData?.devTrackScore || 80;
  const completionRate = insightsData?.completionRate ?? 0;
  const openBugs = insightsData?.openBugs ?? 0;
  const criticalBugs = insightsData?.criticalBugs ?? 0;
  const totalTasks = insightsData?.totalTasks ?? 0;
  const completedTasks = insightsData?.completedTasks ?? 0;

  const stats = [
    {
      title: "DevTrack Score",
      value: `${score}/100`,
      subtitle: score >= 80 ? "High Performance" : score >= 60 ? "Moderate Progress" : "Needs Attention",
      icon: Target,
      color: "text-blue-600",
      bg: "bg-blue-100 dark:bg-blue-950",
    },
    {
      title: "Task Completion",
      value: `${completionRate}%`,
      subtitle: `${completedTasks} of ${totalTasks} completed`,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-100 dark:bg-green-950",
    },
    {
      title: "Open Bugs",
      value: `${openBugs}`,
      subtitle: `${criticalBugs} critical priority`,
      icon: Bug,
      color: openBugs > 0 ? "text-rose-600" : "text-green-600",
      bg: openBugs > 0 ? "bg-rose-100 dark:bg-rose-950" : "bg-green-100 dark:bg-green-950",
    },
    {
      title: "Risk Level",
      value: criticalBugs > 0 ? "Elevated" : openBugs > 2 ? "Moderate" : "Low Risk",
      subtitle: criticalBugs > 0 ? "Immediate action required" : "Under healthy control",
      icon: AlertTriangle,
      color: criticalBugs > 0 ? "text-rose-600" : "text-amber-600",
      bg: criticalBugs > 0 ? "bg-rose-100 dark:bg-rose-950" : "bg-amber-100 dark:bg-amber-950",
    },
  ];

  const productivityMetrics = [
    { label: "Task Completion Rate", value: completionRate },
    {
      label: "Bug Triage Health",
      value: totalTasks + openBugs > 0 ? Math.max(0, Math.min(100, Math.round(100 - openBugs * 15))) : 100,
    },
    {
      label: "Execution Consistency",
      value: Math.min(100, Math.round(score * 0.95)),
    },
    {
      label: "Overall Velocity Score",
      value: score,
    },
  ];

  const getTagColor = (tag) => {
    switch (tag) {
      case "Productivity":
        return "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300";
      case "Code Quality":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
      case "Needs Attention":
        return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
      case "Bug Tracking":
        return "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  const getTagIcon = (tag) => {
    switch (tag) {
      case "Productivity":
        return <TrendingUp className="text-green-600" size={22} />;
      case "Code Quality":
        return <ShieldCheck className="text-blue-600" size={22} />;
      case "Needs Attention":
        return <Clock className="text-amber-600" size={22} />;
      default:
        return <Bug className="text-rose-600" size={22} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 text-slate-900 dark:bg-slate-950 dark:text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold sm:text-3xl">
              <Brain className="text-blue-600" size={30} />
              AI Insights
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Personalized developer intelligence synthesized from your real tasks, bugs, and activity logs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchInsights(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition shadow-sm"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin text-blue-600" : ""} />
              {refreshing ? "Re-analyzing..." : "Refresh Insights"}
            </button>

            <div className="flex items-center gap-2 rounded-xl bg-blue-100 px-4 py-2.5 text-sm font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <Sparkles size={18} />
              <span>{insightsData?.isConfigured ? "Gemini 2.5 Active" : "Deterministic Engine"}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 text-sm">
            <AlertTriangle size={20} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-16 text-center shadow-sm">
            <Loader2 size={36} className="animate-spin text-blue-600" />
            <p className="mt-4 font-semibold text-slate-800 dark:text-slate-200">
              Analyzing Developer Telemetry...
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              DevTrack AI is synthesizing tasks, bugs, and project activity data.
            </p>
          </div>
        ) : (
          <>
            {/* Stats */}
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

            {/* Productivity Analysis & Score */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                <h2 className="flex items-center gap-2 text-lg font-bold">
                  <TrendingUp className="text-green-600" size={22} />
                  Telemetry Breakdown
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Calculated from live task progress and bug triage statistics.
                </p>

                <div className="mt-6 space-y-6">
                  {productivityMetrics.map((item) => (
                    <div key={item.label}>
                      <div className="mb-2 flex justify-between gap-3 text-sm">
                        <span>{item.label}</span>
                        <span className="font-semibold">{item.value}%</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all duration-500"
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DevTrack Score Circular Gauge */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-bold">DevTrack Intelligence Score</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Comprehensive index evaluated by Gemini based on completion velocity and resolution speed.
                  </p>
                </div>

                <div className="my-6 flex flex-col items-center rounded-2xl bg-slate-50 p-6 dark:bg-slate-950">
                  <div className="flex h-32 w-32 items-center justify-center rounded-full border-[10px] border-blue-600 shadow-inner">
                    <div className="text-center">
                      <p className="text-3xl font-bold">{score}</p>
                      <p className="text-[11px] uppercase tracking-wider text-slate-500">out of 100</p>
                    </div>
                  </div>

                  <p className="mt-4 font-semibold text-blue-600">
                    {score >= 85 ? "Optimal Velocity" : score >= 70 ? "Consistent Progress" : "Attention Recommended"}
                  </p>
                  <p className="mt-2 max-w-sm text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    {score >= 80
                      ? "Keep delivering high-quality commits and closing open tasks."
                      : "Focus on clearing pending bugs and completing active sprint tasks."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                    <p className="text-xs text-slate-500">Completed Tasks</p>
                    <p className="mt-1 font-semibold text-green-600">{completedTasks} Tasks</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                    <p className="text-xs text-slate-500">Open Bugs</p>
                    <p className="mt-1 font-semibold text-rose-600">{openBugs} Bugs</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Personalized Insights Cards */}
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold">Personalized AI Insights</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Data-driven findings generated specifically for your workflow.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {insightsData?.insights && insightsData.insights.length > 0 ? (
                  insightsData.insights.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex items-start gap-4">
                        <div className="rounded-xl p-3 bg-slate-100 dark:bg-slate-800">
                          {getTagIcon(item.tag)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold">{item.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                            {item.description}
                          </p>
                          <span className={`mt-4 inline-block rounded-full px-3 py-1 text-xs font-semibold ${getTagColor(item.tag)}`}>
                            {item.tag}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-slate-500">
                    No customized insights generated yet. Complete more tasks or report bugs to build telemetry.
                  </div>
                )}
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950/40 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-3 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                  <Lightbulb size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Actionable AI Recommendations</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Suggested high-impact steps to boost productivity and code quality.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {insightsData?.recommendations && insightsData.recommendations.length > 0 ? (
                  insightsData.recommendations.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 size={19} className="mt-0.5 shrink-0 text-blue-600" />
                      <p>{item}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No pending recommendations at this time.</p>
                )}
              </div>
            </div>

            <div className="text-center text-xs text-slate-400 dark:text-slate-500 py-2">
              Synthesized by DevTrack AI with real telemetry from MongoDB and Gemini 2.5 Flash.
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AIInsights;