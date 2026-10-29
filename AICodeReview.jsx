import { useState, useEffect } from "react";
import {
  Code2,
  Bug,
  ShieldCheck,
  Gauge,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Clock,
  History,
  Info,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function AICodeReview() {
  const { token } = useAuth();
  const [code, setCode] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reviewResult, setReviewResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchReviewHistory();
  }, [token]);

  const fetchReviewHistory = async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:5000/api/ai/code-review/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data.reviews || []);
      }
    } catch (err) {
      console.warn("Could not load review history:", err);
    }
  };

  const handleReview = async () => {
    if (!code.trim()) {
      setErrorMessage("Please enter your source code before starting the review.");
      return;
    }

    setErrorMessage("");
    setIsAnalyzing(true);

    try {
      const res = await fetch("http://localhost:5000/api/ai/code-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to analyze code");
      }

      setReviewResult(data);
      fetchReviewHistory();
    } catch (err) {
      console.error("AI Code Review Error:", err);
      setErrorMessage(err.message || "An error occurred during code analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const score = reviewResult?.score ?? null;
  const metrics = reviewResult?.metrics || { codeQuality: 0, security: 0, performance: 0 };
  const findings = reviewResult?.findings || [];
  const recommendations = reviewResult?.recommendations || [];

  const bugCount = findings.filter((f) => f.category === "Bug" || f.severity === "Critical").length;
  const secCount = findings.filter((f) => f.category === "Security" || f.severity === "High").length;
  const perfCount = findings.filter((f) => f.category === "Performance").length;

  const stats = [
    {
      title: "Potential Bugs",
      value: reviewResult ? String(bugCount) : "--",
      icon: Bug,
      color: "text-red-500",
      bg: "bg-red-100 dark:bg-red-950",
    },
    {
      title: "Security Issues",
      value: reviewResult ? String(secCount) : "--",
      icon: ShieldCheck,
      color: "text-orange-500",
      bg: "bg-orange-100 dark:bg-orange-950",
    },
    {
      title: "Performance",
      value: reviewResult ? String(perfCount) : "--",
      icon: Gauge,
      color: "text-blue-500",
      bg: "bg-blue-100 dark:bg-blue-950",
    },
    {
      title: "Code Health",
      value: reviewResult ? (score >= 80 ? "Good" : score >= 60 ? "Moderate" : "Needs Work") : "--",
      icon: CheckCircle2,
      color: "text-purple-500",
      bg: "bg-purple-100 dark:bg-purple-950",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-4 text-slate-900 dark:bg-slate-950 dark:text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold sm:text-3xl">
              <Code2 className="text-blue-600" size={30} />
              AI Code Review
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Submit your code to Google Gemini for deep defect, security vulnerability, and performance analysis.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
            <Sparkles size={18} />
            Powered by Google Gemini
          </div>
        </div>

        {errorMessage && (
          <div className="flex items-start gap-2.5 rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900">
            <AlertTriangle className="mt-0.5 shrink-0" size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Notice if API key not configured */}
        {reviewResult && reviewResult.isConfigured === false && (
          <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
            <Info className="mt-0.5 shrink-0" size={18} />
            <span>{reviewResult.message}</span>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {item.title}
                  </p>
                  <div className={`rounded-xl p-3 ${item.bg} ${item.color}`}>
                    <Icon size={21} />
                  </div>
                </div>

                <h2 className="mt-4 text-2xl font-bold">{item.value}</h2>
              </div>
            );
          })}
        </div>

        {/* Code Input & Live Summary */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6 xl:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-2.5 text-blue-600 dark:bg-blue-950">
                <Code2 size={22} />
              </div>
              <div>
                <h2 className="font-bold text-base">Submit Source Code</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Paste the function, module, or algorithm you wish to inspect
                </p>
              </div>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={`// Paste your JavaScript, Python, or TypeScript code here...\n\nfunction processOrder(userId, cartItems) {\n  const total = cartItems.reduce((acc, item) => acc + item.price, 0);\n  return { orderId: Math.random(), total };\n}`}
              className="min-h-72 w-full resize-y rounded-xl border border-slate-300 bg-slate-50 p-4 font-mono text-xs sm:text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            />

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {code.length} characters / 25,000 max
              </span>

              <button
                onClick={handleReview}
                disabled={isAnalyzing}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 shadow-md shadow-blue-600/20 disabled:opacity-50"
              >
                <Sparkles size={18} />
                {isAnalyzing ? "Analyzing with Gemini..." : "Analyze Code"}
              </button>
            </div>
          </div>

          {/* Review Score Summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold">Review Scorecard</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Overall code quality rating
              </p>

              <div className="my-6 flex flex-col items-center rounded-2xl bg-slate-50 p-6 dark:bg-slate-950">
                <div className="flex h-28 w-28 items-center justify-center rounded-full border-8 border-blue-600 shadow-md shadow-blue-500/20">
                  <span className="text-3xl font-bold">
                    {score !== null ? score : "--"}
                  </span>
                </div>

                <h3 className="mt-4 font-semibold text-sm">
                  {score !== null
                    ? score >= 80
                      ? "High Quality"
                      : score >= 60
                        ? "Moderate Quality"
                        : "Refactoring Advised"
                    : "Awaiting Analysis"}
                </h3>
              </div>

              <div className="space-y-4">
                {[
                  { label: "Code Quality", value: metrics.codeQuality },
                  { label: "Security", value: metrics.security },
                  { label: "Performance", value: metrics.performance },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-300">
                        {item.label}
                      </span>
                      <span className="font-semibold">{item.value}%</span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all duration-500"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-4 text-[11px] text-slate-400 text-center">
              Evaluated using Gemini 2.5 Flash model
            </p>
          </div>
        </div>

        {/* Structured Findings */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <AlertTriangle className="text-orange-500" size={24} />
            <div>
              <h2 className="text-lg font-bold">Code Review Findings</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Issues identified by Gemini during code analysis
              </p>
            </div>
          </div>

          {findings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
              <Code2 size={32} className="mx-auto mb-2 text-slate-400" />
              <p className="font-medium text-sm">No review generated yet</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Enter code and select Analyze Code to see detailed feedback.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {findings.map((f, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                      {f.category || "Issue"}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        f.severity === "Critical"
                          ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                          : f.severity === "High"
                            ? "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                      }`}
                    >
                      {f.severity}
                    </span>
                  </div>

                  <h3 className="mt-3 font-semibold text-sm">{f.title}</h3>
                  <p className="mt-1.5 text-xs leading-5 text-slate-600 dark:text-slate-300">
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actionable Recommendations */}
        {recommendations.length > 0 && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950/40 sm:p-6">
            <div className="flex items-start gap-3">
              <Lightbulb className="mt-1 shrink-0 text-blue-600 dark:text-blue-400" size={24} />
              <div>
                <h2 className="font-bold text-sm sm:text-base">AI Actionable Recommendations</h2>
                <ul className="mt-3 list-inside list-disc space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  {recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Past Reviews History */}
        {history.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <History size={20} className="text-slate-400" />
              <h3 className="text-base font-bold">Past AI Code Submissions</h3>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {history.map((h) => (
                <div key={h._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-slate-700 dark:text-slate-300 truncate">
                      {h.codeSnippet}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(h.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="shrink-0 font-bold text-blue-600 dark:text-blue-400 text-sm">
                    {h.score}/100
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AICodeReview;
