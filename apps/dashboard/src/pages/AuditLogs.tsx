

import { useState, useEffect } from "react";
import { 
  Activity, 
  Download, 
  Play, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  CircleCheck,
  CircleX,
  CircleAlert,
  Clock,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import { apiRequest } from "@/lib/api";

interface AuditLogEntry {
  id: string;
  agent_id: string;
  action: string;
  result: string;
  reasoning: string | null;
  created_at: string;
  timestamp?: string;
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    const data = await apiRequest('GET', '/api/v1/audit?limit=20');
    if (data && data.entries) {
      setLogs(data.entries);
    }
    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;
    const loadLogs = async () => {
      setLoading(true);
      const data = await apiRequest('GET', '/api/v1/audit?limit=20');
      if (isMounted && data?.entries) {
        setLogs(data.entries);
      }
      if (isMounted) setLoading(false);
    };

    loadLogs();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="flex flex-col gap-lg fade-in">
      <div className="flex justify-between items-end mb-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-display font-bold">Audit Logs</h1>
          <p className="text-text-secondary text-lg">Immutable trail of every action performed by your AI agents.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchLogs}
            className="p-3 bg-surface-hover border border-border rounded-md text-text-secondary hover:text-accent-primary transition-colors"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-md text-sm font-bold text-text-primary hover:bg-surface-hover transition-colors">
            <Download size={18} />
            Export CSV
          </button>
          <button className="btn-primary flex items-center gap-2 ">
            <Play size={18} />
            Live View
          </button>
        </div>
      </div>

      <div className="glass grid grid-cols-1 md:grid-cols-4 gap-lg p-lg">
        <div className="flex flex-col gap-2">
          <label className="label">Agent</label>
          <select className="w-full px-4 py-2.5 bg-background border border-border rounded-md outline-none focus:border-accent-primary transition-colors text-sm font-medium">
            <option>All Agents</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="label">Action</label>
          <select className="w-full px-4 py-2.5 bg-background border border-border rounded-md outline-none focus:border-accent-primary transition-colors text-sm font-medium">
            <option>All Actions</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="label">Severity</label>
          <select className="w-full px-4 py-2.5 bg-background border border-border rounded-md outline-none focus:border-accent-primary transition-colors text-sm font-medium">
            <option>All Severities</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="label">Search Scope</label>
          <div className="flex items-center gap-2 bg-background px-4 py-2.5 rounded-md border border-border group focus-within:border-accent-primary transition-colors">
            <Search size={16} className="text-text-tertiary group-focus-within:text-accent-primary" />
            <input 
              type="text" 
              placeholder="e.g. stripe:*" 
              className="bg-transparent border-none outline-none text-sm text-text-primary w-full placeholder:text-text-tertiary" 
            />
          </div>
        </div>
      </div>

      <div className="glass overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-background/50">
                <th className="px-lg py-4 label text-[10px]">Timestamp</th>
                <th className="px-lg py-4 label text-[10px]">Agent ID</th>
                <th className="px-lg py-4 label text-[10px]">Action</th>
                <th className="px-lg py-4 label text-[10px]">Result</th>
                <th className="px-lg py-4 label text-[10px]">Reasoning</th>
                <th className="px-lg py-4 label text-[10px] text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && logs.length === 0 ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-lg py-8 bg-surface-hover/20"></td>
                  </tr>
                ))
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="group hover:bg-background transition-colors">
                    <td className="px-lg py-5">
                       <div className="flex items-center gap-3 text-sm text-text-secondary whitespace-nowrap">
                        <Clock size={14} className="text-text-tertiary" />
                        <span>{new Date(log.created_at || log.timestamp || '').toLocaleTimeString()}</span>
                       </div>
                    </td>
                    <td className="px-lg py-5">
                      <span className="font-mono text-xs text-accent-primary">{log.agent_id.slice(0, 12)}...</span>
                    </td>
                    <td className="px-lg py-5">
                      <span className="text-sm font-semibold text-text-primary uppercase tracking-tight">{log.action}</span>
                    </td>
                    <td className="px-lg py-5">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        log.result === 'allowed' ? 'bg-success-bg text-success' : 
                        log.result === 'denied' ? 'bg-error-bg text-error' : 'bg-warning-bg text-warning'
                      }`}>
                        {log.result === 'allowed' && <CircleCheck size={14} />}
                        {log.result === 'denied' && <CircleX size={14} />}
                        {log.result === 'pending' && <CircleAlert size={14} />}
                        <span>{log.result}</span>
                      </div>
                    </td>
                    <td className="px-lg py-5">
                      <p className="text-xs text-text-secondary line-clamp-1 max-w-[300px]">
                        {log.reasoning || 'Default system check passed'}
                      </p>
                    </td>
                    <td className="px-lg py-5 text-right">
                      <button className="p-2 text-text-tertiary hover:bg-surface-hover hover:text-accent-primary transition-all rounded-md">
                        <ExternalLink size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
              {!loading && logs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-lg py-12 text-center text-text-tertiary italic">
                    No audit logs recorded yet. Run a demo script to generate traffic.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-lg flex justify-between items-center bg-surface border-t border-border">
          <button className="flex items-center gap-2 text-sm font-bold text-text-tertiary cursor-not-allowed" disabled>
            <ChevronLeft size={18} />
            Previous
          </button>
          <span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">
            {loading ? 'Fetching...' : `Live Feed Active`}
          </span>
          <button className="flex items-center gap-2 text-sm font-bold text-accent-primary hover:bg-accent-light px-4 py-2 rounded-md transition-colors">
            Next
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
