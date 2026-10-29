import { useState } from "react";
import { Outlet } from "react-router-dom";
import DeveloperSidebar from "../components/DeveloperSidebar";
import Topbar from "../components/Topbar";
import AIAssistantDrawer from "../components/AIAssistantDrawer";

function DeveloperLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <DeveloperSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <div className="lg:ml-64 flex flex-col min-h-screen">
        <Topbar
          title="Developer Workspace"
          subtitle="Assigned work, telemetry, AI assistant and productivity insights"
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

export default DeveloperLayout;