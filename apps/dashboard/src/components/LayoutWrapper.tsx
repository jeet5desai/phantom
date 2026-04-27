"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import SidebarNav from "@/components/SidebarNav";
import TopBar from "@/components/TopBar";
import { ShieldCheck } from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const [orgName, setOrgName] = useState("Loading...");

  useEffect(() => {
    if (!isAuthPage) {
      apiRequest('GET', '/api/v1/dashboard/stats').then(data => {
        if (data?.orgName) {
          setOrgName(data.orgName);
        } else {
          setOrgName("Demo Workspace");
        }
      });
    }
  }, [isAuthPage]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-surface flex flex-col fixed inset-y-0 z-50">
        <div className="p-lg flex items-center gap-3">
          <ShieldCheck className="text-accent-primary" size={32} />
          <span className="text-xl font-display font-bold tracking-tight">AgentKey</span>
        </div>
        
        <div className="flex-1 px-4 py-2">
          <SidebarNav />
        </div>
        
        <div className="p-4 border-t border-border">
          <div className="glass p-3 flex items-center gap-3 bg-background">
            <div className="w-10 h-10 rounded-md bg-accent-primary text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {orgName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-text-primary truncate">{orgName}</span>
              <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-wider">Pro Plan</span>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col">
        <TopBar />
        <main className="p-lg">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
