import { useState, useEffect } from "react";
import {
  User,
  Bell,
  Shield,
  Palette,
  Save,
  RotateCcw,
  Check,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function DeveloperSettings() {
  const { user, token, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email] = useState(user?.email || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [githubUsername, setGithubUsername] = useState(user?.githubUsername || "");

  // Notification toggles
  const [notifications, setNotifications] = useState(true);
  const [taskUpdates, setTaskUpdates] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
      setGithubUsername(user.githubUsername || "");
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Full name cannot be empty");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          bio: bio.trim(),
          githubUsername: githubUsername.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      updateUser({
        name: data.user.name,
        bio: data.user.bio,
        githubUsername: data.user.githubUsername,
      });

      setMessage("Profile saved to MongoDB database successfully!");
      setTimeout(() => setMessage(""), 3500);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage("");
    setPasswordError("");

    if (!currentPassword || !newPassword) {
      setPasswordError("Current and new passwords are required");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change password");

      setPasswordMessage("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setPasswordMessage(""), 3500);
    } catch (err) {
      setPasswordError(err.message);
    }
  };

  const handleReset = () => {
    setName(user?.name || "");
    setBio(user?.bio || "");
    setGithubUsername(user?.githubUsername || "");
    setMessage("");
    setErrorMessage("");
  };

  const Toggle = ({ label, description, checked, onChange }) => (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-4">
      <div>
        <p className="font-medium text-slate-800 dark:text-slate-100 text-sm">
          {label}
        </p>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>

      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-blue-600 cursor-pointer"
      />
    </label>
  );

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
            Developer Account Settings
          </p>
          <h1 className="mt-1 text-3xl font-bold">Workspace Preferences</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your developer profile, account security, and notification options.
          </p>
        </div>

        {message && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
            <Check size={18} />
            <span>{message}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900">
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Profile Form */}
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-blue-100 p-3 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <User size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Profile Settings</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Your personal developer identity
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-950/60 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">GitHub Handle</label>
                  <input
                    type="text"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    placeholder="e.g. sayaligorwade"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Account Role</label>
                  <input
                    type="text"
                    value={user?.role || "developer"}
                    readOnly
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm capitalize text-slate-500 dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium">Developer Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={2}
                    placeholder="Brief summary of your tech stack and interests..."
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 shadow-md shadow-blue-600/20 disabled:opacity-50"
                >
                  <Save size={16} />
                  {isSaving ? "Saving..." : "Save Profile"}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <RotateCcw size={16} />
                  Reset
                </button>
              </div>
            </section>
          </form>

          {/* Security & Password */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <Shield size={22} />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Security & Password</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Update account password with bcrypt validation
                </p>
              </div>
            </div>

            {passwordMessage && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <Check size={16} /> <span>{passwordMessage}</span>
              </div>
            )}

            {passwordError && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
                <AlertCircle size={16} /> <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="Enter current password"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Minimum 6 characters"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Change Password
              </button>
            </form>
          </section>

          {/* Notifications */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-xl bg-amber-100 p-3 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                <Bell size={22} />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Notification Preferences</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Control which activity items generate alert banners
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              <Toggle
                label="All Notifications"
                description="Enable or disable all notification updates."
                checked={notifications}
                onChange={(value) => {
                  setNotifications(value);
                  if (!value) {
                    setTaskUpdates(false);
                    setSecurityAlerts(false);
                  }
                }}
              />
              <Toggle
                label="Task Updates"
                description="Updates when assignments, deadlines or statuses change."
                checked={taskUpdates}
                onChange={(value) => {
                  setTaskUpdates(value);
                  if (value) setNotifications(true);
                }}
              />
              <Toggle
                label="Security Alerts"
                description="Critical warnings regarding authentication and account safety."
                checked={securityAlerts}
                onChange={(value) => {
                  setSecurityAlerts(value);
                  if (value) setNotifications(true);
                }}
              />
            </div>
          </section>

          {/* Appearance */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-violet-100 p-3 text-violet-600 dark:bg-violet-950 dark:text-violet-400">
                <Palette size={22} />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Theme Mode</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  DevTrack AI features automatic and toggled Light and Dark theme modes. Use the switch in the sidebar or topbar to toggle.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default DeveloperSettings;