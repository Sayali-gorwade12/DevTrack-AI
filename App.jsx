import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";

// Layouts
import AdminLayout from "./layouts/AdminLayout";
import ManagerLayout from "./layouts/ManagerLayout";
import DeveloperLayout from "./layouts/DeveloperLayout";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Admin / Shared Pages
import AdminDashboard from "./pages/AdminDashboard";
import Users from "./pages/Users";
import Projects from "./pages/Projects";
import Teams from "./pages/Teams";
import Tasks from "./pages/Tasks";
import Bugs from "./pages/Bugs";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import ActivityLog from "./pages/ActivityLog";

// Manager Pages
import ManagerDashboard from "./pages/ManagerDashboard";

// Developer Pages
import DeveloperDashboard from "./pages/DeveloperDashboard";
import MyProjects from "./pages/MyProjects";
import MyTasks from "./pages/MyTasks";
import MyBugs from "./pages/MyBugs";
import GitHubActivity from "./pages/GitHubActivity";
import AICodeReview from "./pages/AICodeReview";
import AIInsights from "./pages/AIInsights";
import CodingProgress from "./pages/CodingProgress";
import CodingStreak from "./pages/CodingStreak";
import DeveloperSettings from "./pages/DeveloperSettings";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/bugs" element={<Bugs />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/activity" element={<ActivityLog />} />
            </Route>
          </Route>

          {/* Manager Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={["manager", "admin"]} />}>
            <Route element={<ManagerLayout />}>
              <Route path="/manager" element={<ManagerDashboard />} />
              <Route path="/manager/projects" element={<Projects />} />
              <Route path="/manager/teams" element={<Teams />} />
              <Route path="/manager/tasks" element={<Tasks />} />
              <Route path="/manager/bugs" element={<Bugs />} />
              <Route path="/manager/reports" element={<Reports />} />
              <Route path="/manager/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Developer Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={["developer", "manager", "admin"]} />}>
            <Route element={<DeveloperLayout />}>
              <Route path="/developer" element={<DeveloperDashboard />} />
              <Route path="/developer/projects" element={<MyProjects />} />
              <Route path="/developer/tasks" element={<MyTasks />} />
              <Route path="/developer/bugs" element={<MyBugs />} />
              <Route path="/developer/github" element={<GitHubActivity />} />
              <Route path="/developer/code-review" element={<AICodeReview />} />
              <Route path="/developer/insights" element={<AIInsights />} />
              <Route path="/developer/progress" element={<CodingProgress />} />
              <Route path="/developer/streak" element={<CodingStreak />} />
              <Route path="/developer/settings" element={<DeveloperSettings />} />
            </Route>
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ErrorBoundary>
    </AuthProvider>
  </BrowserRouter>
  );
}

export default App;