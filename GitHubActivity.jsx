import { useState, useEffect } from "react";
import {
  GitCommit,
  GitPullRequest,
  CircleDot,
  GitBranch,
  TrendingUp,
  CalendarDays,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  Star,
  Unlink,
  Lock,
  BookOpen,
} from "lucide-react";

function GitHubActivity() {
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [status, setStatus] = useState({ connected: false });
  const [activities, setActivities] = useState([]);
  const [repos, setRepos] = useState([]);
  const [stats, setStats] = useState({ commits: 0, pullRequests: 0, issues: 0, contributionScore: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patToken, setPatToken] = useState("");
  const [modalError, setModalError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const fetchGitHubData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const statusRes = await fetch("http://localhost:5000/api/github/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statusData = await statusRes.json();
      setStatus(statusData);

      if (statusData.connected) {
        // Fetch activity and repos concurrently
        const [actRes, reposRes] = await Promise.all([
          fetch("http://localhost:5000/api/github/activity", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/api/github/repos", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const actData = await actRes.json();
        const reposData = await reposRes.json();

        if (actData.success) {
          setActivities(actData.activities || []);
          if (actData.stats) setStats(actData.stats);
        }

        if (reposData.success) {
          setRepos(reposData.repos || []);
        }
      }
    } catch (err) {
      console.error("Error loading GitHub data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGitHubData();
  }, []);

  const handleConnect = async (e) => {
    e.preventDefault();
    setModalError("");
    if (!patToken.trim()) {
      setModalError("Please provide a valid GitHub Personal Access Token");
      return;
    }

    setConnecting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/github/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token: patToken.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPatToken("");
        setIsModalOpen(false);
        setToastMessage(`Connected as @${data.username}`);
        setTimeout(() => setToastMessage(""), 4000);
        await fetchGitHubData();
      } else {
        setModalError(data.message || "Failed to verify GitHub token");
      }
    } catch (err) {
      setModalError("Network error connecting to GitHub. Please check server.");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm("Are you sure you want to disconnect your GitHub account?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/github/disconnect", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        setStatus({ connected: false });
        setActivities([]);
        setRepos([]);
        setStats({ commits: 0, pullRequests: 0, issues: 0, contributionScore: 0 });
        setToastMessage("GitHub account disconnected.");
        setTimeout(() => setToastMessage(""), 4000);
      }
    } catch (err) {
      console.error("Error disconnecting GitHub:", err);
    }
  };

  const getActivityIcon = (type) => {
    if (type === "Commit") {
      return <GitCommit size={18} className="text-blue-600" />;
    }
    if (type === "Pull Request") {
      return <GitPullRequest size={18} className="text-violet-600" />;
    }
    if (type === "Issue") {
      return <CircleDot size={18} className="text-rose-500" />;
    }
    return <GitBranch size={18} className="text-emerald-500" />;
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4 dark:bg-slate-950 sm:p-6 lg:p-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-3 text-sm font-semibold shadow-lg animate-in fade-in duration-200">
          <CheckCircle2 size={18} className="text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm">
            <GitBranch size={26} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              GitHub Activity
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Live tracking of your GitHub repositories, commits, and pull requests.
            </p>
          </div>
        </div>

        <div>
          {status.connected ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 shadow-sm">
                {status.avatarUrl ? (
                  <img
                    src={status.avatarUrl}
                    alt={status.username}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                    {status.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  @{status.username}
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              </div>

              <button
                onClick={handleDisconnect}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition"
                title="Disconnect GitHub"
              >
                <Unlink size={14} />
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 shadow-sm"
            >
              <GitBranch size={18} />
              Connect GitHub
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-16 text-center shadow-sm">
          <Loader2 size={36} className="animate-spin text-blue-600" />
          <p className="mt-4 font-semibold text-slate-800 dark:text-slate-200">
            Fetching GitHub Telemetry...
          </p>
        </div>
      ) : !status.connected ? (
        /* Empty State / Prompt to Connect */
        <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-12 text-center max-w-2xl mx-auto my-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
            <GitBranch size={32} />
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            Connect Your GitHub Account
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Link your GitHub account using a Personal Access Token to sync live commit streaks, pull requests, issue resolution, and repository activity.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition"
            >
              <GitBranch size={18} />
              Connect GitHub Account
            </button>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            Tokens are securely stored in MongoDB and never returned to client applications.
          </p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <GitCommit className="text-blue-600" size={24} />
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-full">
                  Recent Events
                </span>
              </div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Commits</p>
              <h2 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
                {stats.commits}
              </h2>
              <p className="mt-2 text-xs text-slate-500">Live from GitHub API</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <GitPullRequest className="text-violet-600" size={24} />
                <span className="text-xs font-semibold text-violet-600 bg-violet-50 dark:bg-violet-950 px-2 py-0.5 rounded-full">
                  Pull Requests
                </span>
              </div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">PRs Logged</p>
              <h2 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
                {stats.pullRequests}
              </h2>
              <p className="mt-2 text-xs text-slate-500">Open or merged events</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <CircleDot className="text-rose-500" size={24} />
                <span className="text-xs font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded-full">
                  Issues
                </span>
              </div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Issues Active</p>
              <h2 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
                {stats.issues}
              </h2>
              <p className="mt-2 text-xs text-slate-500">Tracked GitHub issues</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <TrendingUp className="text-emerald-500" size={24} />
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                  Activity Index
                </span>
              </div>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Contribution Score</p>
              <h2 className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
                {stats.contributionScore}
              </h2>
              <p className="mt-2 text-xs text-emerald-500">Based on recent events</p>
            </div>
          </section>

          {/* Main Grid: Activity Feed + Connected Repositories */}
          <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* Recent Activity */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-2 overflow-hidden">
              <div className="border-b border-slate-200 p-6 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Recent GitHub Activity
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Latest synchronized events from @{status.username}
                  </p>
                </div>
                <GitBranch className="text-blue-600" size={22} />
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[460px] overflow-y-auto">
                {activities.length > 0 ? (
                  activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4 p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                        {getActivityIcon(activity.type)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                          {activity.title}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {activity.type} • {activity.repo}
                        </p>
                      </div>

                      <span className="shrink-0 text-xs text-slate-400">
                        {activity.date}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-sm text-slate-500">
                    No recent events logged on your GitHub account in the active window.
                  </div>
                )}
              </div>
            </div>

            {/* Repositories List */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-900 dark:text-white">
                      Your Repositories
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {repos.length} active repos
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3 max-h-[380px] overflow-y-auto">
                {repos.length > 0 ? (
                  repos.map((repo) => (
                    <a
                      key={repo.id}
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-xl border border-slate-100 dark:border-slate-800 p-3 hover:border-blue-300 dark:hover:border-blue-700 bg-slate-50/50 dark:bg-slate-800/40 transition group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-blue-600 dark:text-blue-400 group-hover:underline truncate max-w-[180px]">
                          {repo.name}
                        </span>
                        <ExternalLink size={12} className="text-slate-400 group-hover:text-blue-600" />
                      </div>

                      {repo.description && (
                        <p className="mt-1 text-[11px] text-slate-500 line-clamp-1">
                          {repo.description}
                        </p>
                      )}

                      <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                          {repo.language}
                        </span>
                        {repo.stars > 0 && (
                          <span className="flex items-center gap-0.5">
                            <Star size={10} className="text-amber-400 fill-amber-400" />
                            {repo.stars}
                          </span>
                        )}
                        {repo.isPrivate && (
                          <span className="rounded bg-slate-200 dark:bg-slate-700 px-1 py-0.2 text-[9px]">
                            Private
                          </span>
                        )}
                      </div>
                    </a>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-6">
                    No repositories found under this token.
                  </p>
                )}
              </div>
            </div>
          </section>
        </>
      )}

      {/* Connect Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-slate-900 dark:bg-white p-2 text-white dark:text-slate-900">
                  <GitBranch size={20} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Connect GitHub Account
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConnect} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  GitHub Personal Access Token (PAT)
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    value={patToken}
                    onChange={(e) => setPatToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    required
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <p className="mt-2 text-[11px] text-slate-500 leading-normal">
                  Create a token in{" "}
                  <a
                    href="https://github.com/settings/tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-0.5"
                  >
                    GitHub Settings <ExternalLink size={10} />
                  </a>{" "}
                  with scopes: <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">repo</code> and <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">read:user</code>.
                </p>
              </div>

              {modalError && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-3 text-xs text-rose-700 dark:text-rose-300">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={connecting}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {connecting ? <Loader2 size={14} className="animate-spin" /> : <GitBranch size={14} />}
                  {connecting ? "Connecting..." : "Verify & Connect"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default GitHubActivity;