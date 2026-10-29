import { useState, useEffect } from "react";
import {
  Bug,
  AlertCircle,
  Clock3,
  CheckCircle2,
  CalendarDays,
  Plus,
  X,
  Check,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function MyBugs() {
  const { token, user } = useAuth();
  const [bugs, setBugs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");

  // Report Bug Modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [severity, setSeverity] = useState("Medium");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMyBugs();
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchProjects();
    }
  }, [token]);

  const fetchMyBugs = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/bugs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBugs(data.bugs || []);
      }
    } catch (err) {
      console.error("Fetch my bugs error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/projects", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
        if (data.projects?.length > 0) setSelectedProject(data.projects[0].name);
      }
    } catch (err) {
      console.error("Fetch projects error:", err);
    }
  };

  const handleStatusChange = async (bugId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/bugs/${bugId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setActionMessage(`Bug updated to "${newStatus}"`);
        setTimeout(() => setActionMessage(""), 3000);
        fetchMyBugs();
      }
    } catch (err) {
      console.error("Bug status update error:", err);
    }
  };

  const handleReportBug = async (e) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const projObj = projects.find((p) => p.name === selectedProject);

      const res = await fetch("http://localhost:5000/api/bugs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          project: selectedProject || "DevTrack AI",
          projectId: projObj ? projObj._id : "",
          developer: user?.name || "Developer",
          developerId: user?.id,
          severity,
          status: "Open",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to report bug");
      }

      setShowReportModal(false);
      setTitle("");
      setDescription("");
      setSeverity("Medium");
      setActionMessage("Bug reported successfully!");
      setTimeout(() => setActionMessage(""), 3500);
      fetchMyBugs();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCount = bugs.filter((b) => b.status === "Open").length;
  const inProgressCount = bugs.filter((b) => b.status === "In Progress").length;
  const resolvedCount = bugs.filter((b) => b.status === "Resolved").length;

  const severityStyle = (severity) => {
    if (severity === "Critical" || severity === "High") {
      return "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400";
    }
    if (severity === "Medium") {
      return "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400";
    }
    return "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400";
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4 dark:bg-slate-950 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            My Bugs & Issues
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            View, investigate, and update defects assigned to or reported by you.
          </p>
        </div>

        <button
          onClick={() => setShowReportModal(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 shadow-md shadow-blue-600/20"
        >
          <Plus size={18} />
          Report Bug
        </button>
      </div>

      {actionMessage && (
        <div className="mb-5 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
          <Check size={18} />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Stats */}
      <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Bug className="text-blue-600" size={22} />
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Total Bugs
          </p>
          <h2 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
            {loading ? "..." : bugs.length}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <AlertCircle className="text-red-500" size={22} />
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Open Bugs
          </p>
          <h2 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
            {loading ? "..." : openCount}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Clock3 className="text-amber-500" size={22} />
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            In Progress
          </p>
          <h2 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
            {loading ? "..." : inProgressCount}
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <CheckCircle2 className="text-emerald-500" size={22} />
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Resolved
          </p>
          <h2 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
            {loading ? "..." : resolvedCount}
          </h2>
        </div>
      </section>

      {/* Bug List */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 p-6 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Defect Queue
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Update status to Resolved once code fixes are deployed
              </p>
            </div>
            <Bug className="text-blue-600" size={22} />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-400">Loading bugs...</div>
        ) : bugs.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-400">No bugs currently in your queue.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Bug Title
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Project
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Severity
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Reported Date
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status (Interactive)
                  </th>
                </tr>
              </thead>

              <tbody>
                {bugs.map((bug) => (
                  <tr
                    key={bug._id}
                    className="border-b border-slate-100 last:border-0 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 dark:bg-red-500/10">
                          <Bug size={18} className="text-red-500" />
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white text-sm">
                          {bug.title}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-500 dark:text-slate-400">
                      {bug.project}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${severityStyle(
                          bug.severity
                        )}`}
                      >
                        {bug.severity}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <CalendarDays size={14} />
                        {new Date(bug.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <select
                        value={bug.status}
                        onChange={(e) => handleStatusChange(bug._id, e.target.value)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold outline-none cursor-pointer ${
                          bug.status === "Resolved"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                            : bug.status === "In Progress"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                              : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                        }`}
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Report Bug Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Report a Bug
              </h2>
              <button
                onClick={() => setShowReportModal(false)}
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

            <form onSubmit={handleReportBug} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bug Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Unhandled promise rejection on logout"
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
                  placeholder="Describe error logs or unexpected behavior..."
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
                    Severity
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Report Bug"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default MyBugs;
