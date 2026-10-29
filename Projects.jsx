import { useState, useEffect } from "react";
import {
  FolderKanban,
  Plus,
  Search,
  Users,
  CalendarDays,
  Trash2,
  X,
  Check,
  AlertCircle,
  Bug,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Projects() {
  const { token, user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Projects");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [error, setError] = useState("");

  // Create Project state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Active");
  const [deadline, setDeadline] = useState("");
  const [selectedManager, setSelectedManager] = useState("DevTrack Manager");
  const [selectedDeveloper, setSelectedDeveloper] = useState("Sayali");
  const [managers, setManagers] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const canManage = user?.role === "admin" || user?.role === "manager";

  const getMemberCount = (members) => {
    if (Array.isArray(members)) return members.length;
    if (typeof members === "number") return members;
    if (typeof members === "string" && !isNaN(Number(members))) return Number(members);
    return 1;
  };

  const getMemberNames = (members) => {
    if (!Array.isArray(members)) return "";
    const names = members
      .map((m) => (typeof m === "object" && m !== null ? m.name || m.userName : m))
      .filter(Boolean);
    return names.length > 0 ? ` (${names.join(", ")})` : "";
  };

  useEffect(() => {
    fetchProjects();
    fetchAssignableUsers();
  }, [token, search, statusFilter]);

  const fetchAssignableUsers = async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:5000/api/projects/assignable-users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const mgrs = data.managers || [];
        const devs = data.developers || [];
        setManagers(mgrs);
        setDevelopers(devs);
        if (mgrs.length > 0) {
          const match = mgrs.find((m) => m.name === user?.name) || mgrs.find((m) => m.name === "DevTrack Manager") || mgrs[0];
          setSelectedManager(match.name);
        }
        if (devs.length > 0) {
          const matchDev = devs.find((d) => d.name === "Sayali") || devs[0];
          setSelectedDeveloper(matchDev.name);
        }
      }
    } catch (err) {
      console.error("Fetch assignable users error:", err);
    }
  };

  const fetchProjects = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams();
      if (search) query.append("search", search);
      if (statusFilter !== "All Projects") query.append("status", statusFilter);

      const res = await fetch(`http://localhost:5000/api/projects?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to fetch projects (Status: ${res.status})`);
      }
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err) {
      console.error("Fetch projects error:", err);
      setError(err.message || "Unable to load projects. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const mgrObj = managers.find((m) => m.name === selectedManager);
      const devObj = developers.find((d) => d.name === selectedDeveloper);

      const res = await fetch("http://localhost:5000/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
          status,
          deadline,
          manager: selectedManager || user?.name || "DevTrack Manager",
          managerId: mgrObj ? mgrObj._id : null,
          developerIds: devObj ? [devObj._id] : [],
          members: devObj ? [{ userId: devObj._id, name: devObj.name, role: "Developer" }] : 1,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create project");
      }

      setShowCreateModal(false);
      setName("");
      setDescription("");
      setStatus("Active");
      setDeadline("");
      setActionMessage("Project created successfully!");
      setTimeout(() => setActionMessage(""), 3500);
      fetchProjects();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (projectId, projectName) => {
    if (!window.confirm(`Are you sure you want to delete "${projectName}"? All related tasks and bugs will also be deleted.`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/projects/${projectId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setActionMessage(`Project "${projectName}" deleted.`);
        setTimeout(() => setActionMessage(""), 3000);
        fetchProjects();
      }
    } catch (err) {
      console.error("Delete project error:", err);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4 dark:bg-slate-950 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Projects
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage projects, monitor deadlines, and track real delivery progress.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 shadow-md shadow-blue-600/20"
          >
            <Plus size={18} />
            Create Project
          </button>
        )}
      </div>

      {actionMessage && (
        <div className="mb-5 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
          <Check size={18} />
          <span>{actionMessage}</span>
        </div>
      )}

      {error && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchProjects}
            className="rounded-lg bg-red-600 px-3 py-1.5 font-semibold text-white hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search & Filter */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <Search size={19} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="ml-3 w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          <option>All Projects</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="On Hold">On Hold</option>
        </select>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-900">
          Loading projects from MongoDB...
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-900">
          No projects found. {canManage ? "Click 'Create Project' above to add your first project." : ""}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {projects.map((proj) => (
            <div
              key={proj._id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                      <FolderKanban size={23} />
                    </div>

                    <div>
                      <h2 className="font-semibold text-slate-900 dark:text-white text-base">
                        {proj.name}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                        {proj.description || "No description provided."}
                      </p>
                    </div>
                  </div>

                  {canManage && (
                    <button
                      onClick={() => handleDeleteProject(proj._id, proj.name)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition"
                      title="Delete Project"
                    >
                      <Trash2 size={17} />
                    </button>
                  )}
                </div>

                {/* Status Badge */}
                <div className="mt-4 flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      proj.status === "Active"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : proj.status === "Completed"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                    }`}
                  >
                    {proj.status}
                  </span>

                  {proj.openBugs > 0 && (
                    <span className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
                      <Bug size={13} /> {proj.openBugs} open bug(s)
                    </span>
                  )}
                </div>

                {/* Real Progress */}
                <div className="mt-5">
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">
                      Task Progress
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {proj.progress || 0}% ({proj.completedTasks || 0} of {proj.totalTasks || 0} tasks)
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${proj.progress || 0}%` }}
                    />
                  </div>
                </div>

                {/* Project Details */}
                <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Users size={16} className="text-slate-400 shrink-0" />
                    <span className="truncate" title={Array.isArray(proj.members) ? proj.members.map(m => typeof m === "object" ? m.name : m).join(", ") : ""}>
                      Team: {getMemberCount(proj.members)} Member{getMemberCount(proj.members) === 1 ? "" : "s"}
                      {getMemberNames(proj.members)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <CalendarDays size={16} className="text-slate-400 shrink-0" />
                    <span>Deadline: {proj.deadline || "None"}</span>
                  </div>
                </div>
              </div>

              {/* Manager & Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">Manager: </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {typeof proj.manager === "object" && proj.manager !== null
                      ? proj.manager.name || "DevTrack Manager"
                      : proj.manager || "DevTrack Manager"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Create New Project
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

            <form onSubmit={handleCreateProject} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. AI Workflow Engine"
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
                  rows={3}
                  placeholder="Summary of project goals and scope..."
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="On Hold">On Hold</option>
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
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Project Manager
                </label>
                <select
                  value={selectedManager}
                  onChange={(e) => setSelectedManager(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {managers.map((m) => (
                    <option key={m._id || m.name} value={m.name}>
                      {m.name} ({m.role})
                    </option>
                  ))}
                  {managers.length === 0 && (
                    <option value="DevTrack Manager">DevTrack Manager</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Developer
                </label>
                <select
                  value={selectedDeveloper}
                  onChange={(e) => setSelectedDeveloper(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">-- Select a Developer --</option>
                  {developers.map((d) => (
                    <option key={d._id || d.name} value={d.name}>
                      {d.name} ({d.email})
                    </option>
                  ))}
                  {developers.length === 0 && (
                    <option value="Sayali">Sayali (sayali@gmail.com)</option>
                  )}
                </select>
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
                  {isSubmitting ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Projects;