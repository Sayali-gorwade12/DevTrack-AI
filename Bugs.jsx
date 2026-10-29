import { useState, useEffect } from "react";
import {
  Bug as BugIcon,
  Plus,
  Search,
  User,
  Trash2,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Bugs() {
  const { token, user } = useAuth();
  const [bugs, setBugs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All Severity");
  const [statusFilter, setStatusFilter] = useState("All Status");

  // Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedDeveloper, setSelectedDeveloper] = useState("");
  const [severity, setSeverity] = useState("Medium");
  const [status, setStatus] = useState("Open");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  const canDelete = user?.role === "admin" || user?.role === "manager";

  useEffect(() => {
    fetchBugs();
  }, [token, search, severityFilter, statusFilter]);

  useEffect(() => {
    if (token) {
      fetchProjectsAndDevelopers();
    }
  }, [token]);

  const fetchBugs = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append("search", search);
      if (severityFilter !== "All Severity") query.append("severity", severityFilter);
      if (statusFilter !== "All Status") query.append("status", statusFilter);

      const res = await fetch(`http://localhost:5000/api/bugs?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBugs(data.bugs || []);
      }
    } catch (err) {
      console.error("Fetch bugs error:", err);
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

  const handleReportBug = async (e) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const projObj = projects.find((p) => p.name === selectedProject) || projects[0];
      const devObj = developers.find((d) => d.name === selectedDeveloper) || developers.find((d) => d.name === "Sayali") || developers[0];

      const res = await fetch("http://localhost:5000/api/bugs", {
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
          severity,
          status,
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
      setStatus("Open");
      setActionMessage("Bug reported successfully!");
      setTimeout(() => setActionMessage(""), 3500);
      fetchBugs();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
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
        setActionMessage(`Bug status updated to ${newStatus}`);
        setTimeout(() => setActionMessage(""), 3000);
        fetchBugs();
      }
    } catch (err) {
      console.error("Bug status update error:", err);
    }
  };

  const handleDeleteBug = async (bugId, bugTitle) => {
    if (!window.confirm(`Delete bug "${bugTitle}"?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/bugs/${bugId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setActionMessage("Bug deleted.");
        setTimeout(() => setActionMessage(""), 3000);
        fetchBugs();
      }
    } catch (err) {
      console.error("Delete bug error:", err);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4 dark:bg-slate-950 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Bug Tracking
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track, prioritize, and resolve software defects across all projects.
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

      {/* Search & Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <Search size={19} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bugs by title, project, or developer..."
            className="ml-3 w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
          />
        </div>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          <option>All Severity</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          <option>All Status</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      {/* Bugs Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left">
            <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                  Bug
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                  Project
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                  Reported By
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                  Assigned To
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                  Severity
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                  Status
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
                    Loading bugs from MongoDB...
                  </td>
                </tr>
              ) : bugs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-400">
                    No matching bugs found.
                  </td>
                </tr>
              ) : (
                bugs.map((bug) => (
                  <tr
                    key={bug._id}
                    className="border-b border-slate-100 last:border-0 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                          <BugIcon size={18} />
                        </div>
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">
                          {bug.title}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {bug.project}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {bug.reporter}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                        <User size={15} className="text-slate-400" />
                        {bug.developer || "Unassigned"}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          bug.severity === "Critical"
                            ? "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                            : bug.severity === "High"
                              ? "bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400"
                              : bug.severity === "Medium"
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {bug.severity}
                      </span>
                    </td>

                    <td className="px-6 py-4">
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

                    <td className="px-6 py-4">
                      {canDelete && (
                        <button
                          onClick={() => handleDeleteBug(bug._id, bug.title)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition"
                          title="Delete bug"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Bug Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Report a Defect / Bug
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
                  placeholder="e.g. Session expires unexpectedly on refresh"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Steps to Reproduce
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Describe what occurred and steps to reproduce..."
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
                    Assign To
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

              <div className="grid grid-cols-2 gap-3">
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

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
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
                  {isSubmitting ? "Reporting..." : "Submit Bug"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Bugs;