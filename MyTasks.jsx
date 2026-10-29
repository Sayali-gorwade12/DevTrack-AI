import { useState, useEffect } from "react";
import {
  ListTodo,
  Clock3,
  LoaderCircle,
  CheckCircle2,
  CalendarDays,
  Flag,
  Check,
  ExternalLink,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  Send,
  History,
  FileCode,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function MyTasks() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");

  // Submission Modal States
  const [submittingTask, setSubmittingTask] = useState(null);
  const [repoUrl, setRepoUrl] = useState("");
  const [completionNotes, setCompletionNotes] = useState("");
  const [testingDetails, setTestingDetails] = useState("");
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchMyTasks();
  }, [token]);

  const fetchMyTasks = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error("Fetch my tasks error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setActionMessage(`Task updated to "${newStatus}"`);
        setTimeout(() => setActionMessage(""), 3000);
        fetchMyTasks();
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const handleOpenSubmitModal = (task) => {
    setSubmittingTask(task);
    setRepoUrl(task.submission?.repoUrl || "");
    setCompletionNotes(task.submission?.completionNotes || "");
    setTestingDetails(task.submission?.testingDetails || "");
    setSubmitError("");
    setShowHistory(false);
  };

  const handleSubmitWork = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!repoUrl.trim()) {
      setSubmitError("Repository or Pull Request URL is required.");
      return;
    }

    try {
      const parsed = new URL(repoUrl.trim());
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        setSubmitError("URL must start with http:// or https://");
        return;
      }
    } catch (_) {
      setSubmitError("Please enter a valid HTTP or HTTPS URL (e.g. https://github.com/org/repo/pull/123)");
      return;
    }

    if (!completionNotes.trim()) {
      setSubmitError("Please enter completion notes describing the work performed.");
      return;
    }

    if (!testingDetails.trim()) {
      setSubmitError("Please enter testing details or verification results.");
      return;
    }

    setIsSubmittingWork(true);
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${submittingTask._id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          repoUrl: repoUrl.trim(),
          completionNotes: completionNotes.trim(),
          testingDetails: testingDetails.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to submit task for review");
      }

      setActionMessage(data.message || "Work submitted for review successfully!");
      setTimeout(() => setActionMessage(""), 4000);
      setSubmittingTask(null);
      fetchMyTasks();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmittingWork(false);
    }
  };

  const pendingCount = tasks.filter((t) => t.status === "Pending").length;
  const inProgressCount = tasks.filter((t) => t.status === "In Progress").length;
  const underReviewCount = tasks.filter(
    (t) => t.status === "Submitted for Review" || t.status === "Changes Requested"
  ).length;
  const completedCount = tasks.filter((t) => t.status === "Completed").length;

  const changesRequestedTasks = tasks.filter((t) => t.status === "Changes Requested");

  const getPriorityStyle = (priority) => {
    if (priority === "Critical" || priority === "High") {
      return "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400";
    }
    if (priority === "Medium") {
      return "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400";
    }
    return "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400";
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4 dark:bg-slate-950 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          My Tasks
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage, implement, and submit assigned tasks for manager review.
        </p>
      </div>

      {actionMessage && (
        <div className="mb-5 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
          <Check size={18} />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Changes Requested Banner if any */}
      {changesRequestedTasks.length > 0 && (
        <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-300">
                Action Required: Changes Requested ({changesRequestedTasks.length})
              </h3>
              <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
                Your manager has requested updates on one or more tasks. Click "Revise & Resubmit" in the table below to review feedback and resubmit your changes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <ListTodo className="text-blue-600" size={22} />
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Total Tasks
          </p>
          <h2 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
            {loading ? "..." : tasks.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <LoaderCircle className="text-blue-500" size={22} />
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            In Progress / Pending
          </p>
          <h2 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
            {loading ? "..." : pendingCount + inProgressCount}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Clock3 className="text-violet-500" size={22} />
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Under Review
          </p>
          <h2 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
            {loading ? "..." : underReviewCount}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <CheckCircle2 className="text-emerald-500" size={22} />
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Completed / Approved
          </p>
          <h2 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
            {loading ? "..." : completedCount}
          </h2>
        </div>
      </section>

      {/* Tasks Table */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 p-6 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Assigned Work Items
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Update status as you work, and submit code repository or pull request when ready for manager review.
              </p>
            </div>
            <ListTodo className="text-blue-600" size={22} />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-400">Loading your tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-400">No tasks currently assigned to you.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[850px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Task
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Project
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Priority
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Due Date
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Submission & Review
                  </th>
                </tr>
              </thead>

              <tbody>
                {tasks.map((task) => {
                  const isSubmitted = task.status === "Submitted for Review";
                  const isChangesRequested = task.status === "Changes Requested";
                  const isApproved = task.status === "Completed" && task.reviewStatus === "Approved";
                  const hasSubmission = Boolean(task.submission);

                  return (
                    <tr
                      key={task._id}
                      className="border-b border-slate-100 last:border-0 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10 shrink-0">
                            <ListTodo size={18} className="text-blue-600" />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-white text-sm">
                              {task.title}
                            </span>
                            {task.description && (
                              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-500 dark:text-slate-400">
                        {task.project}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${getPriorityStyle(
                            task.priority
                          )}`}
                        >
                          <Flag size={12} />
                          {task.priority}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <CalendarDays size={14} />
                          {task.deadline || "None"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task._id, e.target.value)}
                          className={`rounded-full px-3 py-1 text-xs font-semibold outline-none cursor-pointer ${
                            task.status === "Completed"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                              : task.status === "In Progress"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                                : task.status === "Submitted for Review"
                                  ? "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400"
                                  : task.status === "Changes Requested"
                                    ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Submitted for Review">Submitted for Review</option>
                          <option value="Changes Requested">Changes Requested</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>

                      <td className="px-6 py-5">
                        {isChangesRequested ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                              <AlertCircle size={12} />
                              Changes Requested
                            </span>
                            <button
                              onClick={() => handleOpenSubmitModal(task)}
                              className="rounded-lg bg-amber-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-amber-700 transition"
                            >
                              Revise & Resubmit
                            </button>
                          </div>
                        ) : isSubmitted ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 border border-violet-200 dark:border-violet-800">
                              <Clock3 size={12} />
                              Pending Review
                            </span>
                            <button
                              onClick={() => handleOpenSubmitModal(task)}
                              className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 underline"
                            >
                              View Work
                            </button>
                          </div>
                        ) : isApproved ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 size={12} />
                              Approved
                            </span>
                            <button
                              onClick={() => handleOpenSubmitModal(task)}
                              className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 underline"
                            >
                              Details
                            </button>
                          </div>
                        ) : hasSubmission ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenSubmitModal(task)}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 text-xs font-semibold transition"
                            >
                              <FileCode size={13} />
                              Submission Details
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenSubmitModal(task)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition"
                          >
                            <Send size={13} />
                            Submit Work
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Task Submission / Resubmission Modal */}
      {submittingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="my-8 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCode className="text-blue-600" size={22} />
                  {submittingTask.status === "Changes Requested"
                    ? "Revise & Resubmit Work"
                    : submittingTask.status === "Submitted for Review"
                      ? "Task Submission Details"
                      : submittingTask.status === "Completed" && submittingTask.reviewStatus === "Approved"
                        ? "Approved Task Submission"
                        : "Submit Task for Review"}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {submittingTask.title} • {submittingTask.project}
                </p>
              </div>
              <button
                onClick={() => setSubmittingTask(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Task Summary Box */}
            <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60 text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-500">
                <span>Priority: <strong className="text-slate-800 dark:text-slate-200">{submittingTask.priority}</strong></span>
                <span>Deadline: <strong className="text-slate-800 dark:text-slate-200">{submittingTask.deadline || "No deadline"}</strong></span>
                <span>Current Status: <strong className="text-slate-800 dark:text-slate-200">{submittingTask.status}</strong></span>
              </div>
              {submittingTask.description && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Task Requirements:</p>
                  <p className="text-slate-600 dark:text-slate-400">{submittingTask.description}</p>
                </div>
              )}
            </div>

            {/* Manager Feedback Banner (if Changes Requested or Approved) */}
            {submittingTask.submission?.reviewFeedback && (
              <div
                className={`mt-4 rounded-xl p-4 border text-xs ${
                  submittingTask.status === "Changes Requested"
                    ? "border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300"
                    : "border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300"
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  {submittingTask.status === "Changes Requested" ? (
                    <AlertCircle size={16} className="text-amber-600" />
                  ) : (
                    <CheckCircle2 size={16} className="text-emerald-600" />
                  )}
                  <span>
                    Manager Feedback ({submittingTask.submission.reviewerName || "Reviewer"}):
                  </span>
                </div>
                <p className="pl-6 whitespace-pre-wrap">{submittingTask.submission.reviewFeedback}</p>
              </div>
            )}

            {/* Error Message */}
            {submitError && (
              <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900">
                {submitError}
              </div>
            )}

            {/* Submission Form */}
            <form onSubmit={handleSubmitWork} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  GitHub Repository / Pull Request URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://github.com/organization/repo/pull/123"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  disabled={submittingTask.status === "Completed" && submittingTask.reviewStatus === "Approved"}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Provide a valid URL to the branch, commit, or PR where code changes can be inspected.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Completion Notes & Implementation Summary <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Summarize key architectural changes, endpoints added, or components refactored..."
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  disabled={submittingTask.status === "Completed" && submittingTask.reviewStatus === "Approved"}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Testing Details & Verification Results <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe unit tests run, edge cases validated, and manual verification steps..."
                  value={testingDetails}
                  onChange={(e) => setTestingDetails(e.target.value)}
                  disabled={submittingTask.status === "Completed" && submittingTask.reviewStatus === "Approved"}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
              </div>

              {/* Submission History Accordion */}
              {Array.isArray(submittingTask.submissionHistory) && submittingTask.submissionHistory.length > 0 && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex w-full items-center justify-between p-3 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <span className="flex items-center gap-1.5">
                      <History size={14} className="text-slate-500" />
                      Previous Submission History ({submittingTask.submissionHistory.length})
                    </span>
                    {showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {showHistory && (
                    <div className="border-t border-slate-200 dark:border-slate-800 p-3 space-y-3 bg-slate-50/50 dark:bg-slate-900/50 text-xs">
                      {submittingTask.submissionHistory.map((hist, idx) => (
                        <div key={idx} className="rounded-lg border border-slate-200 dark:border-slate-800 p-2.5 bg-white dark:bg-slate-900">
                          <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
                            <span>Round #{idx + 1}</span>
                            <span>{hist.submittedAt ? new Date(hist.submittedAt).toLocaleString() : "Past submission"}</span>
                          </div>
                          <p className="font-mono text-[11px] text-blue-600 dark:text-blue-400 truncate">
                            {hist.repoUrl}
                          </p>
                          <p className="mt-1 text-slate-600 dark:text-slate-300">
                            <strong>Notes:</strong> {hist.completionNotes}
                          </p>
                          {hist.reviewFeedback && (
                            <p className="mt-1 text-amber-700 dark:text-amber-400">
                              <strong>Feedback:</strong> {hist.reviewFeedback}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSubmittingTask(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                >
                  Close
                </button>

                {!(submittingTask.status === "Completed" && submittingTask.reviewStatus === "Approved") && (
                  <button
                    type="submit"
                    disabled={isSubmittingWork}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition disabled:opacity-60 shadow-md shadow-blue-600/20"
                  >
                    {isSubmittingWork ? (
                      <>
                        <LoaderCircle size={14} className="animate-spin" />
                        Submitting...
                      </>
                    ) : submittingTask.status === "Changes Requested" ? (
                      <>
                        <Send size={14} />
                        Resubmit Work for Review
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        Submit for Review
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default MyTasks;