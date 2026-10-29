import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import AIAssistantDrawer from "../components/AIAssistantDrawer";

function AdminLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <div className="lg:ml-64 flex flex-col min-h-screen">
        <Topbar
          title="Admin Workspace"
          subtitle="Platform overview, operations and system health"
          onMenuClick={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      <AIAssistantDrawer />
    </div>
  );
}

export default AdminLayout;
