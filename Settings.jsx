import { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  User,
  ShieldCheck,
  Bell,
  Save,
  Check,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

function Settings() {
  const { token, user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Admin Profile state
  const [name, setName] = useState(user?.name || "");
  const [email] = useState(user?.email || "");

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Platform Notification / Policy Settings state
  const [bugAlerts, setBugAlerts] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [allowPublicRegistration, setAllowPublicRegistration] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, [token]);

  const fetchSettings = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setBugAlerts(data.settings.bugAlerts !== false);
          setProjectUpdates(data.settings.projectUpdates !== false);
          setEmailNotifications(Boolean(data.settings.emailNotifications));
          setAllowPublicRegistration(data.settings.allowPublicRegistration !== false);
        }
      }
    } catch (err) {
      console.error("Fetch settings error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setActionMessage("");
    setErrorMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      updateUser({ name });
      setActionMessage("Profile details updated successfully.");
      setTimeout(() => setActionMessage(""), 3500);
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setActionMessage("");
    setErrorMessage("");

    try {
      const res = await fetch("http://localhost:5000/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bugAlerts,
          projectUpdates,
          emailNotifications,
          allowPublicRegistration,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save settings");

      setActionMessage("Platform settings saved successfully.");
      setTimeout(() => setActionMessage(""), 3500);
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage("");
    setPasswordError("");

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
      if (!res.ok) throw new Error(data.message || "Password update failed");

      setPasswordMessage("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setPasswordMessage(""), 3500);
    } catch (err) {
      setPasswordError(err.message);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4 dark:bg-slate-950 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            <SettingsIcon size={23} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Platform & Account Settings
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage system-wide configuration, access policies, and admin credentials.
            </p>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
          <Check size={18} />
          <span>{actionMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-900">
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Admin Profile */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User size={20} className="text-blue-600" />
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">
                  Administrator Profile
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Update your identity details.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Save size={16} /> Save Profile
            </button>
          </form>
        </section>

        {/* Security / Password Management */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 flex items-center gap-3">
            <ShieldCheck size={20} className="text-emerald-600" />
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Account Security & Password
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Update account password with bcrypt validation.
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
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Enter current password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Update Password
            </button>
          </form>
        </section>

        {/* Platform Policy & Notification Settings */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 flex items-center gap-3">
            <Bell size={20} className="text-amber-500" />
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Platform Preferences & Access Rules
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                System-wide defaults saved directly to MongoDB settings.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <label className="flex cursor-pointer items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Critical Bug Alerts
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Elevate notification badges on high-severity defect reports.
                </p>
              </div>
              <input
                type="checkbox"
                checked={bugAlerts}
                onChange={(e) => setBugAlerts(e.target.checked)}
                className="h-4 w-4 accent-blue-600"
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Project Delivery Alerts
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Broadcast status updates when tasks are completed or missed.
                </p>
              </div>
              <input
                type="checkbox"
                checked={projectUpdates}
                onChange={(e) => setProjectUpdates(e.target.checked)}
                className="h-4 w-4 accent-blue-600"
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Allow Public Developer Registration
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Allow new engineers to sign up self-service via /register.
                </p>
              </div>
              <input
                type="checkbox"
                checked={allowPublicRegistration}
                onChange={(e) => setAllowPublicRegistration(e.target.checked)}
                className="h-4 w-4 accent-blue-600"
              />
            </label>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 shadow-md shadow-blue-600/20"
              >
                <Save size={18} />
                Save Platform Preferences
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

export default Settings;