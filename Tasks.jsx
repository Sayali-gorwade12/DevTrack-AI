import { useState, useEffect } from "react";
import {
  ListTodo,
  Plus,
  Search,
  CalendarDays,
  Trash2,
  X,
  Check,
  AlertCircle,
  ExternalLink,
  FileCode,
  History,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Tasks() {
  const { token, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [priorityFilter, setPriorityFilter] = useState("All Priority");

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedDeveloper, setSelectedDeveloper] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("Pending");
  const [deadline, setDeadline] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  // Review Modal State (Manager / Admin)
  const [reviewingTask, setReviewingTask] = useState(null);
  const [reviewDecision, setReviewDecision] = useState("Approve");
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [showReviewHistory, setShowReviewHistory] = useState(false);

  const canManage = user?.role === "admin" || user?.role === "manager";

  useEffect(() => {
    fetchTasks();
  }, [token, search, statusFilter, priorityFilter]);

  useEffect(() => {
    if (canManage && token) {
      fetchProjectsAndDevelopers();
    }
  }, [token, canManage]);

  const fetchTasks = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append("search", search);
      if (statusFilter !== "All Status") query.append("status", statusFilter);
      if (priorityFilter !== "All Priority") query.append("priority", priorityFilter);

      const res = await fetch(`http://localhost:5000/api/tasks?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error("Fetch tasks error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectsAndDevelopers = async () => {
    try {
      const [projRes, devRes] = await Promise.all([
        fetch("http://localhost:5000/api/projects", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:5000/api/projects/assignable-users", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (projRes.ok) {
        const pData = await projRes.json();
        const projs = pData.projects || [];
        setProjects(projs);
        if (projs.length > 0 && !selectedProject) setSelectedProject(projs[0].name);
      }
      if (devRes.ok) {
        const dData = await devRes.json();
        const devs = dData.developers || [];
        setDevelopers(devs);
        if (devs.length > 0 && !selectedDeveloper) {
          const defaultDev = devs.find((d) => d.name === "Sayali") || devs[0];
          setSelectedDeveloper(defaultDev.name);
        }
      }
    } catch (err) {
      console.error("Failed to fetch projects or developers:", err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const projObj = projects.find((p) => p.name === selectedProject) || projects[0];
      const devObj = developers.find((d) => d.name === selectedDeveloper) || developers.find((d) => d.name === "Sayali") || developers[0];

      const res = await fetch("http://localhost:5000/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          project: selectedProject || (projObj ? projObj.name : "DevTrack AI"),
          projectId: projObj ? projObj._id : "",
          developer: selectedDeveloper || (devObj ? devObj.name : "Sayali"),
          developerId: devObj ? devObj._id : null,
          priority,
          status,
          deadline,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create task");
      }

      setShowCreateModal(false);
      setTitle("");
      setDescription("");
      setPriority("Medium");
      setStatus("Pending");
      setDeadline("");
      setActionMessage("Task created successfully!");
      setTimeout(() => setActionMessage(""), 3500);
      fetchTasks();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
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
        setActionMessage(`Task updated to ${newStatus}`);
        setTimeout(() => setActionMessage(""), 3000);
        fetchTasks();
      }
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const handleDeleteTask = async (taskId, taskTitle) => {
    if (!window.confirm(`Delete task "${taskTitle}"?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setActionMessage("Task deleted.");
        setTimeout(() => setActionMessage(""), 3000);
        fetchTasks();
      }
    } catch (err) {
      console.error("Delete task error:", err);
    }
  };

  const handleOpenReviewModal = (task) => {
    setReviewingTask(task);
    setReviewDecision(task.status === "Changes Requested" ? "Request Changes" : "Approve");
    setReviewFeedback(task.submission?.reviewFeedback || "");
    setReviewError("");
    setShowReviewHistory(false);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError("");

    if (reviewDecision === "Request Changes" && !reviewFeedback.trim()) {
      setReviewError("Feedback is required when requesting changes.");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${reviewingTask._id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          decision: reviewDecision,
          feedback: reviewFeedback.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to submit review");
      }

      setActionMessage(data.message || "Review submitted successfully!");
      setTimeout(() => setActionMessage(""), 3500);
      setReviewingTask(null);
      fetchTasks();
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4 dark:bg-slate-950 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Task Management
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Monitor, assign, and review engineering work across all projects.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 shadow-md shadow-blue-600/20"
          >
            <Plus size={18} />
            Create Task
          </button>
        )}
      </div>

      {actionMessage && (
        <div className="mb-5 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
          <Check size={18} />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Search & Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <Search size={19} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks by title, project, or developer..."
            className="ml-3 w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          <option>All Status</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Submitted for Review">Submitted for Review</option>
          <option value="Changes Requested">Changes Requested</option>
          <option value="Completed">Completed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          <option>All Priority</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Tasks Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left">
            <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                  Task
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                  Developer
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                  Priority
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                  Deadline
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                  Code Review
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-400">
                    Loading tasks from MongoDB...
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-400">
                    No matching tasks found.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => {
                  const isSubmitted = task.status === "Submitted for Review";
                  const isChangesRequested = task.status === "Changes Requested";
                  const isApproved = task.status === "Completed" && task.reviewStatus === "Approved";
                  const hasSubmission = Boolean(task.submission);

                  return (
                    <tr
                      key={task._id}
                      className="border-b border-slate-100 last:border-0 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 shrink-0">
                            <ListTodo size={18} />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white text-sm">
                              {task.title}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {task.project}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-medium">
                        {task.developer || "Unassigned"}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            task.priority === "Critical"
                              ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                              : task.priority === "High"
                                ? "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400"
                                : task.priority === "Medium"
                                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400"
                                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>

                      <td className="px-6 py-4">
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
                                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Submitted for Review">Submitted for Review</option>
                          <option value="Changes Requested">Changes Requested</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                          <CalendarDays size={14} className="text-slate-400" />
                          {task.deadline || "No deadline"}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {isSubmitted ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 border border-violet-200 dark:border-violet-800">
                              <Clock3 size={12} />
                              Pending Review
                            </span>
                            {canManage && (
                              <button
                                onClick={() => handleOpenReviewModal(task)}
                                className="rounded-lg bg-violet-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-violet-700 transition shadow-sm"
                              >
                                Review
                              </button>
                            )}
                          </div>
                        ) : isChangesRequested ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                              <AlertCircle size={12} />
                              Changes Requested
                            </span>
                            <button
                              onClick={() => handleOpenReviewModal(task)}
                              className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 underline"
                            >
                              View
                            </button>
                          </div>
                        ) : isApproved ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 size={12} />
                              Approved
                            </span>
                            <button
                              onClick={() => handleOpenReviewModal(task)}
                              className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 underline"
                            >
                              View
                            </button>
                          </div>
                        ) : hasSubmission ? (
                          <button
                            onClick={() => handleOpenReviewModal(task)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 underline"
                          >
                            <FileCode size={13} />
                            Submission Details
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">Not submitted</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {canManage && (
                          <button
                            onClick={() => handleDeleteTask(task._id, task.title)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition"
                            title="Delete task"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal (Manager & Admin) */}
      {reviewingTask && reviewingTask.submission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="my-8 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileCode className="text-violet-600" size={22} />
                  Manager Code Review
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {reviewingTask.title} • {reviewingTask.project}
                </p>
              </div>
              <button
                onClick={() => setReviewingTask(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Task Info & Submission Details */}
            <div className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3.5 dark:bg-slate-800/60">
                <div>
                  <span className="text-slate-400">Assigned Developer:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {reviewingTask.developer || "Unassigned"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Submitted At:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {reviewingTask.submission.submittedAt
                      ? new Date(reviewingTask.submission.submittedAt).toLocaleString()
                      : "Recently"}
                  </p>
                </div>
              </div>

              {/* Repository / PR URL */}
              <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800 bg-white dark:bg-slate-900">
                <span className="text-slate-400 block mb-1">Code Repository / Pull Request:</span>
                <a
                  href={reviewingTask.submission.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
                >
                  <span>{reviewingTask.submission.repoUrl}</span>
                  <ExternalLink size={14} className="shrink-0" />
                </a>
              </div>

              {/* Completion Notes */}
              <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800 bg-white dark:bg-slate-900">
                <span className="text-slate-400 block mb-1 font-semibold">Developer Notes:</span>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {reviewingTask.submission.completionNotes || "No notes provided."}
                </p>
              </div>

              {/* Testing Details */}
              <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800 bg-white dark:bg-slate-900">
                <span className="text-slate-400 block mb-1 font-semibold">Testing & Verification:</span>
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {reviewingTask.submission.testingDetails || "No testing details provided."}
                </p>
              </div>

              {/* Previous History Accordion */}
              {Array.isArray(reviewingTask.submissionHistory) && reviewingTask.submissionHistory.length > 0 && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowReviewHistory(!showReviewHistory)}
                    className="flex w-full items-center justify-between p-3 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <span className="flex items-center gap-1.5">
                      <History size={14} className="text-slate-500" />
                      Previous Submissions ({reviewingTask.submissionHistory.length})
                    </span>
                    {showReviewHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {showReviewHistory && (
                    <div className="border-t border-slate-200 dark:border-slate-800 p-3 space-y-2 bg-slate-50/50 dark:bg-slate-900/50 text-xs">
                      {reviewingTask.submissionHistory.map((hist, idx) => (
                        <div key={idx} className="rounded-lg border border-slate-200 dark:border-slate-800 p-2.5 bg-white dark:bg-slate-900">
                          <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
                            <span>Round #{idx + 1}</span>
                            <span>{hist.submittedAt ? new Date(hist.submittedAt).toLocaleString() : ""}</span>
                          </div>
                          <p className="font-mono text-blue-600 truncate">{hist.repoUrl}</p>
                          <p className="mt-1 text-slate-600 dark:text-slate-300">
                            <strong>Notes:</strong> {hist.completionNotes}
                          </p>
                          {hist.reviewFeedback && (
                            <p className="mt-1 text-amber-600 dark:text-amber-400">
                              <strong>Past Feedback:</strong> {hist.reviewFeedback}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Existing Review Status Banner */}
            {reviewingTask.submission.reviewStatus && reviewingTask.submission.reviewStatus !== "Pending Review" && (
              <div
                className={`mt-4 rounded-xl p-3.5 border text-xs ${
                  reviewingTask.submission.reviewStatus === "Approved"
                    ? "border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300"
                    : "border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300"
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-1">
                  {reviewingTask.submission.reviewStatus === "Approved" ? (
                    <CheckCircle2 size={16} className="text-emerald-600" />
                  ) : (
                    <AlertCircle size={16} className="text-amber-600" />
                  )}
                  <span>
                    Status: {reviewingTask.submission.reviewStatus} (Reviewed by {reviewingTask.submission.reviewerName || "Manager"})
                  </span>
                </div>
                <p className="pl-6">{reviewingTask.submission.reviewFeedback}</p>
              </div>
            )}

            {/* Error Message */}
            {reviewError && (
              <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900">
                {reviewError}
              </div>
            )}

            {/* Review Form for Manager / Admin */}
            {canManage && (
              <form onSubmit={handleSubmitReview} className="mt-5 space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Review Decision:
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-slate-800 dark:text-slate-200">
                      <input
                        type="radio"
                        name="decision"
                        value="Approve"
                        checked={reviewDecision === "Approve"}
                        onChange={() => setReviewDecision("Approve")}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <CheckCircle2 size={14} />
                        Approve Submission
                      </span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-slate-800 dark:text-slate-200">
                      <input
                        type="radio"
                        name="decision"
                        value="Request Changes"
                        checked={reviewDecision === "Request Changes"}
                        onChange={() => setReviewDecision("Request Changes")}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span className="flex items-center gap-1 text-amber-600 font-semibold">
                        <AlertCircle size={14} />
                        Request Changes
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Manager Feedback {reviewDecision === "Request Changes" && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    rows={3}
                    required={reviewDecision === "Request Changes"}
                    placeholder={
                      reviewDecision === "Request Changes"
                        ? "Specify the code changes, architectural fixes, or additional test coverage required..."
                        : "Optional review notes or praise for the developer..."
                    }
                    value={reviewFeedback}
                    onChange={(e) => setReviewFeedback(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs outline-none focus:border-violet-500 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewingTask(null)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className={`flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-semibold text-white transition shadow-md ${
                      reviewDecision === "Approve"
                        ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                        : "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20"
                    }`}
                  >
                    {isSubmittingReview ? "Submitting Review..." : `Submit ${reviewDecision}`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Create New Task
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateTask} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Implement OAuth Flow"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Details of the implementation requirements..."
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Project
                  </label>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {projects.map((p) => (
                      <option key={p._id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                    {projects.length === 0 && <option value="DevTrack AI">DevTrack AI</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assignee (Developer)
                  </label>
                  <select
                    value={selectedDeveloper}
                    onChange={(e) => setSelectedDeveloper(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {developers.map((d) => (
                      <option key={d._id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                    {developers.length === 0 && <option value="Sayali">Sayali</option>}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-2.5 py-2 text-xs outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-2.5 py-2 text-xs outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-2 py-1.5 text-xs outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Tasks;