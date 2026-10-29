import { useState } from "react";
import { Outlet } from "react-router-dom";
import ManagerSidebar from "../components/ManagerSidebar";
import Topbar from "../components/Topbar";
import AIAssistantDrawer from "../components/AIAssistantDrawer";

function ManagerLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <ManagerSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <div className="lg:ml-64 flex flex-col min-h-screen">
        <Topbar
          title="Manager Workspace"
          subtitle="Project progress, team allocation, deadlines and risk monitoring"
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

export default ManagerLayout;
