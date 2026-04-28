import { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Cpu,
  Activity,
  ShieldCheck,
  Settings,
  RefreshCw,
  ExternalLink,
  Lock,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { apiRequest } from '@/lib/api';

interface Agent {
  id: string;
  name: string;
  model: string;
  version?: string;
  created_at: string;
  revoked_at?: string | null;
}

interface Permission {
  id: string;
  resource: string;
  action: string;
}

interface TimelineEntry {
  event: string;
  time: string;
  type: string;
  status: 'success' | 'failure';
}

export default function AgentDetails() {
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [revoking, setRevoking] = useState(false);

  const formatTime = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const loadData = useCallback(async () => {
    // We only set loading if it's not already true (e.g. on manual refresh)
    setLoading(true);
    const [agentRes, permRes, auditRes] = await Promise.all([
      apiRequest('GET', `/api/v1/agents/${id}`),
      apiRequest('GET', `/api/v1/agents/${id}/permissions`),
      apiRequest('GET', `/api/v1/audit?agentId=${id}&limit=5`),
    ]);

    if (agentRes?.agent) setAgent(agentRes.agent);
    if (permRes?.permissions) setPermissions(permRes.permissions);
    if (auditRes?.entries) {
      setTimeline(
        auditRes.entries.map(
          (log: { action: string; created_at: string; resource?: string; result: string }) => ({
            event: log.action,
            time: formatTime(new Date(log.created_at)),
            type: log.resource || 'system',
            status: log.result === 'allowed' || log.result === 'success' ? 'success' : 'failure',
          }),
        ),
      );
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    let isMounted = true;

    const fetch = async () => {
      // Small delay to ensure we're out of the synchronous render path
      await Promise.resolve();
      if (isMounted) {
        await loadData();
      }
    };

    fetch();

    return () => {
      isMounted = false;
    };
  }, [loadData]);

  const handleRevoke = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to revoke this agent? All associated sessions will be terminated. This action cannot be undone.',
    );
    if (!confirmed) return;

    setRevoking(true);
    const result = await apiRequest('POST', `/api/v1/agents/${id}/revoke`);
    if (result?.agent) {
      setAgent(result.agent);
    }
    setRevoking(false);
  };

  if (loading) {
    return (
      <div className="flex p-16 justify-center items-center">
        <RefreshCw size={32} className="animate-spin text-accent-primary" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex flex-col p-16 justify-center items-center gap-4">
        <AlertCircle size={48} className="text-text-tertiary" />
        <h2 className="text-2xl font-bold text-text-secondary">Agent not found</h2>
        <Link to="/agents" className="text-accent-primary hover:underline">
          Return to Agents
        </Link>
      </div>
    );
  }

  const isRevoked = !!agent.revoked_at;
  const status = isRevoked ? 'Revoked' : 'Active';
  const createdDate = new Date(agent.created_at).toLocaleDateString();

  return (
    <div className="flex flex-col gap-lg fade-in">
      <div className="flex items-center gap-4 mb-2">
        <Link
          to="/agents"
          className="p-2 border border-border rounded-md text-text-tertiary hover:bg-surface-hover hover:text-text-primary transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-display font-bold">{agent.name}</h1>
            <div
              className={`flex items-center gap-2 px-3 py-1 border rounded-full ${
                isRevoked ? 'bg-error-bg border-error/20' : 'bg-success-bg border-success/20'
              }`}
            >
              {!isRevoked && (
                <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
              )}
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  isRevoked ? 'text-error' : 'text-success'
                }`}
              >
                {status}
              </span>
            </div>
          </div>
          <span className="text-sm font-mono text-text-tertiary tracking-tight">{agent.id}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-lg">
        {/* Main Stats and Overview */}
        <div className="xl:col-span-2 flex flex-col gap-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <div className="glass p-lg flex flex-col gap-2">
              <span className="label">Total Permissions</span>
              <span className="text-3xl font-display font-bold">{permissions.length}</span>
            </div>
            <div className="glass p-lg flex flex-col gap-2">
              <span className="label">Recent Actions</span>
              <span className="text-3xl font-display font-bold">{timeline.length}</span>
            </div>
            <div className="glass p-lg flex flex-col gap-2">
              <span className="label">Status</span>
              <span
                className={`text-3xl font-display font-bold ${isRevoked ? 'text-error' : 'text-success'}`}
              >
                {isRevoked ? 'Inactive' : 'Healthy'}
              </span>
            </div>
          </div>

          <div className="glass flex flex-col">
            <div className="px-lg py-5 border-b border-border flex items-center justify-between bg-surface">
              <div className="flex items-center gap-3">
                <ShieldCheck size={20} className="text-text-secondary" />
                <h3 className="text-xl font-display font-bold">Permissions</h3>
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-md text-xs font-bold text-text-secondary hover:bg-surface-hover transition-colors">
                <Plus size={14} />
                Edit Access
              </button>
            </div>
            <div className="p-lg">
              {permissions.length === 0 ? (
                <p className="text-sm text-text-tertiary italic">No permissions granted yet.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {permissions.map((perm) => (
                    <div
                      key={perm.id}
                      className="flex items-center justify-between p-4 bg-background border border-border rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-surface border border-border rounded flex items-center justify-center">
                          <Lock size={16} className="text-text-tertiary" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{perm.resource}</span>
                          <span className="text-[10px] text-text-tertiary uppercase tracking-wider font-bold">
                            {perm.action}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-success-bg text-success`}
                      >
                        <CheckCircle2 size={12} />
                        <span>Granted</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="glass flex flex-col">
            <div className="px-lg py-5 border-b border-border flex items-center justify-between bg-surface">
              <div className="flex items-center gap-3">
                <Activity size={20} className="text-text-secondary" />
                <h3 className="text-xl font-display font-bold">Activity Timeline</h3>
              </div>
              <Link
                to="/audit-logs"
                className="text-xs font-bold text-accent-primary hover:underline flex items-center gap-1"
              >
                View all logs <ExternalLink size={12} />
              </Link>
            </div>
            <div className="p-lg flex flex-col gap-6">
              {timeline.length === 0 ? (
                <p className="text-sm text-text-tertiary italic">No recent activity found.</p>
              ) : (
                timeline.map((item, i) => (
                  <div key={i} className="flex gap-4 relative">
                    {i !== timeline.length - 1 && (
                      <div className="absolute left-3 top-8 bottom-[-24px] w-[2px] bg-border"></div>
                    )}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                        item.status === 'success'
                          ? 'bg-success-bg text-success'
                          : 'bg-error-bg text-error'
                      }`}
                    >
                      {item.status === 'success' ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <AlertCircle size={14} />
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-text-primary">{item.event}</span>
                      <div className="flex items-center gap-3 text-[11px] text-text-tertiary font-medium">
                        <span className="flex items-center gap-1">
                          <Clock size={10} /> {item.time}
                        </span>
                        <span className="uppercase tracking-widest">{item.type}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Settings & Config */}
        <div className="flex flex-col gap-lg">
          <div className="glass p-lg flex flex-col gap-6">
            <h3 className="text-lg font-display font-bold border-b border-border pb-4">
              Agent Configuration
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="label">Base Model</label>
                <div className="flex items-center gap-3 p-3 bg-background border border-border rounded-lg">
                  <Cpu size={18} className="text-accent-primary" />
                  <span className="font-bold text-sm">{agent.model || 'Unknown'}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="label">Version</label>
                <span className="text-sm font-bold text-text-secondary">
                  {agent.version || '1.0.0'}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="label">Creation Date</label>
                <span className="text-sm font-bold text-text-secondary">{createdDate}</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 pt-4">
              <button
                className="btn-outline flex items-center justify-center gap-2 py-3"
                disabled={isRevoked}
              >
                <RefreshCw size={16} />
                Rotate Credentials
              </button>
              <button className="btn-outline flex items-center justify-center gap-2 py-3">
                <Settings size={16} />
                Advanced Settings
              </button>
            </div>
          </div>

          {!isRevoked && (
            <div className="glass p-lg flex flex-col gap-4 border-error/20 bg-error-bg/30">
              <div className="flex items-center gap-3 text-error">
                <Trash2 size={20} />
                <h3 className="font-display font-bold">Danger Zone</h3>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Once an agent is revoked, all its associated sessions will be terminated. This
                action cannot be undone.
              </p>
              <button
                id="revoke-agent-button"
                onClick={handleRevoke}
                disabled={revoking}
                className="w-full py-3 bg-error text-white rounded-md font-bold text-sm hover:bg-error/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {revoking ? 'Revoking...' : 'Revoke Agent'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
