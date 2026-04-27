"use client";

import { useState, useEffect } from "react";
import { 
  Plug, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  RefreshCw
} from "lucide-react";
import { apiRequest } from "@/lib/api";

const ICON_COLORS: Record<string, string> = {
  stripe: "bg-[#635bff]",
  gmail: "bg-[#ea4335]",
  slack: "bg-[#4a154b]",
  github: "bg-[#24292e]",
};

const CATEGORY_MAP: Record<string, string> = {
  api_key: "API Key Auth",
  oauth2: "OAuth 2.0",
};

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      const data = await apiRequest('GET', '/api/v1/integrations');
      if (isMounted && data?.integrations) {
        setIntegrations(data.integrations);
      }
      if (isMounted) setLoading(false);
    };
    load();
    return () => { isMounted = false; };
  }, []);

  const fetchIntegrations = async () => {
    setLoading(true);
    const data = await apiRequest('GET', '/api/v1/integrations');
    if (data?.integrations) {
      setIntegrations(data.integrations);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-lg fade-in">
      <div className="flex justify-between items-end mb-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-display font-bold">Integrations</h1>
          <p className="text-text-secondary text-lg">Connect and manage the third-party services your agents interact with.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchIntegrations}
            className="p-3 bg-surface-hover border border-border rounded-md text-text-secondary hover:text-accent-primary transition-colors"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button className="btn-primary flex items-center gap-2 shadow-md shadow-accent-primary/20">
            <Plus size={20} />
            <span>Browse Marketplace</span>
          </button>
        </div>
      </div>

      <div className="glass flex justify-between items-center px-lg py-4">
        <div className="flex items-center gap-3 flex-1">
          <Search size={18} className="text-text-tertiary" />
          <input 
            type="text" 
            placeholder="Search integrations..." 
            className="bg-transparent border-none outline-none text-text-primary w-full text-sm placeholder:text-text-tertiary"
          />
        </div>
        <div className="flex gap-3">
          <select className="bg-background border border-border rounded-md px-3 py-2 text-sm font-bold text-text-secondary outline-none focus:border-accent-primary transition-colors">
            <option>All Categories</option>
            <option>API Key Auth</option>
            <option>OAuth 2.0</option>
          </select>
        </div>
      </div>

      {loading && integrations.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass h-[260px] animate-pulse bg-surface-hover/50"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {integrations.map((app) => (
            <div key={app.id} className="glass p-lg flex flex-col gap-6 hover:border-accent-primary transition-all duration-300 group">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${ICON_COLORS[app.id] || 'bg-accent-primary'} rounded-xl flex items-center justify-center text-white font-bold text-xl`}>
                    {app.name[0]}
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-display font-bold text-lg">{app.name}</h3>
                    <span className="text-xs text-text-tertiary font-medium">{CATEGORY_MAP[app.authType] || app.authType}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-success-bg text-success">
                  <CheckCircle2 size={12} />
                  <span>Available</span>
                </div>
              </div>

              <p className="text-sm text-text-secondary leading-relaxed h-12 overflow-hidden line-clamp-2">
                {app.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                <div className="flex flex-col">
                  <span className="label text-[10px]">Scopes</span>
                  <span className="text-xs font-bold text-text-primary">{app.scopeCount} actions</span>
                </div>
                <div className="flex gap-2">
                  {app.docsUrl && (
                    <a 
                      href={app.docsUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 border border-border rounded-md text-text-tertiary hover:bg-surface-hover hover:text-accent-primary transition-all"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                  <button className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all bg-accent-primary text-white hover:bg-accent-dark">
                    Configure
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
