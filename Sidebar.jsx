import {
  LayoutDashboard,
  Users,
  FolderKanban,
  UsersRound,
  ListTodo,
  Bug,
  BarChart3,
  Settings,
  History,
  LogOut,
  Sun,
  Moon,
  X,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

function Sidebar({ isOpen, onClose }) {
  const { darkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    {
      name: "Overview",
      path: "/",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "Users",
      path: "/users",
      icon: <Users size={20} />,
    },
    {
      name: "Projects",
      path: "/projects",
      icon: <FolderKanban size={20} />,
    },
    {
      name: "Teams",
      path: "/teams",
      icon: <UsersRound size={20} />,
    },
    {
      name: "Tasks",
      path: "/tasks",
      icon: <ListTodo size={20} />,
    },
    {
      name: "Bugs",
      path: "/bugs",
      icon: <Bug size={20} />,
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <BarChart3 size={20} />,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <Settings size={20} />,
    },
    {
      name: "Activity Log",
      path: "/activity",
      icon: <History size={20} />,
    },
  ];

  const sidebarClasses = `fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-slate-200 bg-white text-slate-900 transition-transform duration-300 dark:border-slate-800 dark:bg-slate-950 dark:text-white ${
    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
  }`;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside className={sidebarClasses}>
        {/* Logo Header */}
        <div className="flex h-20 items-center justify-between border-b border-slate-200 px-6 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-md shadow-blue-500/20">
              D
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">DevTrack</h2>
              <span className="text-[11px] font-semibold tracking-wider text-blue-600 dark:text-blue-400">
                ADMIN PANEL
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === "/"}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                  }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          {/* Theme Toggle */}
          <div className="mb-3 rounded-xl bg-slate-50 p-2.5 dark:bg-slate-900/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium">
                {darkMode ? <Moon size={16} /> : <Sun size={16} />}
                <span>{darkMode ? "Dark Theme" : "Light Theme"}</span>
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle theme mode"
                className={`relative h-6 w-11 min-w-11 shrink-0 rounded-full transition-colors duration-300 ${
                  darkMode ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                    darkMode ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* User Badge */}
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-slate-50 p-2.5 dark:bg-slate-900/60">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-semibold text-white text-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold truncate">
                {user?.name || "DevTrack Admin"}
              </h4>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
                {user?.role || "Administrator"}
              </span>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/30 dark:hover:text-red-400"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;