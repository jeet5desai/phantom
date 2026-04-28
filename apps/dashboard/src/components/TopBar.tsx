"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Bell, 
  Search, 
  ChevronDown,
  CircleCheck,
  CircleAlert,
  Info
} from "lucide-react";

export default function TopBar() {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, type: "success", title: "New Agent Created", message: "invoice-processor is now live.", time: "2m ago" },
    { id: 2, type: "warning", title: "Policy Conflict", message: "Check financial write guardrails.", time: "1h ago" },
    { id: 3, type: "info", title: "System Update", message: "Kernel v2.4 successfully deployed.", time: "4h ago" },
  ];

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-lg bg-surface sticky top-0 z-50">
      <div className="flex items-center gap-3 bg-background px-4 py-2 rounded-md border border-border w-96 group focus-within:border-accent-primary transition-colors">
        <Search size={16} className="text-text-tertiary group-focus-within:text-accent-primary" />
        <input 
          type="text" 
          placeholder="Search agents, logs, tokens..." 
          className="bg-transparent border-none outline-none text-sm text-text-primary w-full placeholder:text-text-tertiary"
        />
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative">
          <button 
            className={`p-2 rounded-md transition-colors relative ${showNotifications ? 'bg-surface-hover text-accent-primary' : 'text-text-secondary hover:bg-surface-hover'}`}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-accent-primary border-2 border-surface rounded-full"></span>
          </button>
          
          {showNotifications && (
            <div className="absolute top-12 right-0 w-80 glass z-50 overflow-hidden fade-in">
              <div className="p-4 border-b border-border flex justify-between items-center">
                <h4 className="font-display font-semibold">Notifications</h4>
                <button className="text-xs font-bold text-accent-primary hover:underline">Mark all read</button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-4 border-b border-border flex gap-3 hover:bg-background transition-colors cursor-pointer last:border-none">
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
                      n.type === 'success' ? 'bg-success-bg text-success' : 
                      n.type === 'warning' ? 'bg-warning-bg text-warning' : 
                      'bg-accent-light text-accent-primary'
                    }`}>
                      {n.type === 'success' && <CircleCheck size={16} />}
                      {n.type === 'warning' && <CircleAlert size={16} />}
                      {n.type === 'info' && <Info size={16} />}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold text-text-primary">{n.title}</span>
                      <p className="text-xs text-text-secondary leading-normal">{n.message}</p>
                      <span className="text-[10px] text-text-tertiary mt-1 font-medium">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-border">
                <Link 
                  href="/notifications"
                  className="block w-full text-center text-xs font-bold text-accent-primary py-2 hover:bg-accent-light rounded-md transition-colors"
                  onClick={() => setShowNotifications(false)}
                >
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pl-6 border-l border-border cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-accent-light text-accent-primary flex items-center justify-center text-xs font-bold ring-2 ring-offset-2 ring-transparent group-hover:ring-accent-primary transition-all">
            JD
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-text-primary">John Doe</span>
            <ChevronDown size={14} className="text-text-tertiary" />
          </div>
        </div>
      </div>
    </header>
  );
}
