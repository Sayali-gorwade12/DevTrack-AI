import { Menu, Search, Bell, Sun, Moon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function Topbar({ onMenuClick, title = "Dashboard", subtitle }) {
  const { user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";
  const userRoleDisplay = user?.role === "admin"
    ? "Administrator"
    : user?.role === "manager"
      ? "Project Manager"
      : "Developer";

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95 sm:px-6 lg:px-8">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Open sidebar menu"
        >
          <Menu size={22} />
        </button>

        {/* Page Title */}
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
            {title}
          </h1>

          <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
            {subtitle || `Welcome back, ${user?.name || "User"}`}
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Quick Search */}
        <div className="hidden items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 md:flex dark:border-slate-800 dark:bg-slate-900">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="ml-2 w-32 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white lg:w-48"
          />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Toggle light or dark theme"
        >
          {darkMode ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        {/* Notifications */}
        <button
          className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="View notifications"
        >
          <Bell size={19} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-500" />
        </button>

        {/* User Profile Badge */}
        <div className="flex items-center gap-3 border-l border-slate-200 pl-3 dark:border-slate-800 sm:pl-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-sm shadow-blue-500/20">
            {userInitial}
          </div>

          <div className="hidden lg:block text-left">
            <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
              {userRoleDisplay}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;