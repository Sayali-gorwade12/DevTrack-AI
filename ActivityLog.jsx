import { useState, useEffect } from "react";
import {
  History,
  Search,
  User,
  FolderKanban,
  ListTodo,
  Bug,
  Settings,
  Shield,
  GitBranch,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function ActivityLog() {
  const { token } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchActivityLogs();
  }, [token, search]);

  const fetchActivityLogs = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append("search", search);

      const res = await fetch(`http://localhost:5000/api/activity?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
      }
    } catch (err) {
      console.error("Fetch activity error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "project":
        return <FolderKanban size={18} />;
      case "task":
        return <ListTodo size={18} />;
      case "bug":
        return <Bug size={18} />;
      case "settings":
        return <Settings size={18} />;
      case "github":
        return <GitBranch size={18} />;
      case "auth":
        return <Shield size={18} />;
      default:
        return <User size={18} />;
    }
  };

  const formatTimestamp = (dateString) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute(s) ago`;
    if (diffHours < 24) return `${diffHours} hour(s) ago`;
    return `${diffDays} day(s) ago (${date.toLocaleDateString()})`;
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4 dark:bg-slate-950 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          <History size={23} />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            System Audit & Activity Log
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Immutable audit record of all significant operations performed across DevTrack AI.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 flex items-center rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
        <Search size={19} className="text-slate-400 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search activity by user, action, or target item..."
          className="ml-3 w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
        />
      </div>

      {/* Activity Timeline List */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400">Loading audit events...</div>
        ) : activities.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">No activity events recorded yet.</div>
        ) : (
          <div className="space-y-6">
            {activities.map((activity, index) => (
              <div key={activity._id || index} className="flex gap-4">
                {/* Timeline Line & Node */}
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                    {getActivityIcon(activity.targetType)}
                  </div>
                  {index !== activities.length - 1 && (
                    <div className="mt-2 h-full w-px bg-slate-200 dark:bg-slate-800" />
                  )}
                </div>

                {/* Details */}
                <div className="pb-4">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {activity.userName}
                    </span>{" "}
                    {activity.action}{" "}
                    {activity.target && (
                      <span className="font-semibold text-slate-900 dark:text-white">
                        "{activity.target}"
                      </span>
                    )}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {formatTimestamp(activity.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default ActivityLog;