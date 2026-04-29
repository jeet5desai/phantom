import { useState, useEffect } from 'react';
import { useRequest } from '@/hooks/useRequest';
import {
  Bot,
  Zap,
  ShieldCheck,
  Activity,
  Plus,
  ChevronRight,
  Clock,
  AlertCircle,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface RecentActivity {
  type: 'success' | 'error' | 'info';
  action: string;
  agent: string;
  meta: string;
}

interface Agent {
  id: string;
  name: string;
  model: string;
  status: 'ACTIVE' | 'PAUSED' | 'REVOKED';
  createdAt: string;
}

interface DashboardStats {
  activeAgents: number;
  totalTokens: number;
  blockedEscalations: number;
  auditIntegrity: number;
  recentActivity: RecentActivity[];
}

export default function Home() {
  const request = useRequest();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAgents, setRecentAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    const [statsData, agentsData] = await Promise.all([
      request('GET', '/api/v1/dashboard/stats'),
      request('GET', '/api/v1/agents'),
    ]);
    if (statsData) setStats(statsData);
    if (agentsData?.agents) {
      // Sort by creation date (newest first) and take top 4
      const sorted = agentsData.agents.sort(
        (a: Agent, b: Agent) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setRecentAgents(sorted.slice(0, 4));
    }
    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      const [statsData, agentsData] = await Promise.all([
        request('GET', '/api/v1/dashboard/stats'),
        request('GET', '/api/v1/agents'),
      ]);
      if (isMounted) {
        if (statsData) setStats(statsData);
        if (agentsData?.agents) {
          const sorted = agentsData.agents.sort(
            (a: Agent, b: Agent) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
          setRecentAgents(sorted.slice(0, 4));
        }
        setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [request]);

  return (
    <div className="flex flex-col gap-lg fade-in">
      <div className="flex justify-between items-end mb-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-display font-bold">Security Overview</h1>
          <p className="text-text-secondary text-lg">
            Real-time governance and audit metrics for Phantom.
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="p-3 bg-surface-hover border border-border rounded-md text-text-secondary hover:text-accent-primary transition-colors"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
        <div className="glass p-lg flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Bot size={16} className="text-accent-primary" />
            <span className="label">Active Agents</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-display font-bold">
              {loading ? '...' : stats?.activeAgents || 0}
            </span>
            <div className="flex items-center gap-1 text-xs font-bold text-success">
              <TrendingUp size={12} />
              <span>Stable</span>
            </div>
          </div>
        </div>
        <div className="glass p-lg flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-accent-primary" />
            <span className="label">Issued Tokens</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-display font-bold">
              {loading ? '...' : stats?.totalTokens || 0}
            </span>
            <div className="flex items-center gap-1 text-xs font-bold text-success">
              <TrendingUp size={12} />
              <span>Live</span>
            </div>
          </div>
        </div>
        <div className="glass p-lg flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-accent-primary" />
            <span className="label">Blocked Actions</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-display font-bold">
              {loading ? '...' : stats?.blockedEscalations || 0}
            </span>
            <span className="text-xs font-bold text-text-tertiary">Policies Enforced</span>
          </div>
        </div>
        <div className="glass p-lg flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-accent-primary" />
            <span className="label">Audit Integrity</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-display font-bold text-success">
              {loading ? '...' : stats?.auditIntegrity || 0}%
            </span>
            <span className="text-[10px] font-bold text-success bg-success-bg px-2 py-1 rounded-full uppercase">
              Verified
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Agents Preview */}
        <section className="lg:col-span-2 glass overflow-hidden flex flex-col">
          <div className="px-lg py-4 border-b border-border flex items-center justify-between bg-surface">
            <div className="flex items-center gap-3">
              <Bot size={18} className="text-text-secondary" />
              <h3 className="text-lg font-display font-bold">Recent Agents</h3>
            </div>
          </div>
          <div className="p-lg flex-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-surface-hover rounded-lg animate-pulse" />
                ))}
              </div>
            ) : recentAgents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentAgents.map((agent: Agent) => (
                  <Link
                    key={agent.id}
                    to={`/agents/${agent.id}`}
                    className="flex items-center justify-between p-4 bg-surface-hover border border-border rounded-lg hover:border-accent-primary transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent-light rounded-lg flex items-center justify-center text-accent-primary group-hover:scale-110 transition-transform">
                        <Bot size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-text-primary text-sm group-hover:text-accent-primary transition-colors">
                          {agent.name}
                        </span>
                        <span className="text-xs text-text-tertiary">Model: {agent.model}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {agent.status === 'ACTIVE' && (
                        <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                      )}
                      {agent.status === 'PAUSED' && (
                        <span className="w-2 h-2 rounded-full bg-warning"></span>
                      )}
                      <span
                        className={`text-[10px] font-bold uppercase ${agent.status === 'REVOKED' ? 'text-error' : agent.status === 'PAUSED' ? 'text-warning' : 'text-text-secondary'}`}
                      >
                        {agent.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-8">
                <div className="w-16 h-16 bg-surface-hover rounded-full flex items-center justify-center">
                  <Bot size={32} className="text-text-tertiary" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-text-primary font-bold">No Agents Found</p>
                  <p className="text-text-tertiary text-sm">
                    Get started by creating your first AI identity.
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="mt-auto p-lg border-t border-border bg-surface/50">
            <Link
              to="/agents"
              className="text-accent-primary font-bold text-sm hover:underline flex items-center gap-1 w-fit"
            >
              Manage All Agents <ChevronRight size={16} />
            </Link>
          </div>
        </section>

        {/* Audit Stream */}
        <section className="glass overflow-hidden flex flex-col">
          <div className="px-lg py-4 border-b border-border flex items-center gap-3 bg-surface">
            <Activity size={18} className="text-text-secondary" />
            <h3 className="text-lg font-display font-bold">Live Audit Stream</h3>
          </div>
          <div className="p-lg flex flex-col gap-5">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="w-9 h-9 bg-surface-hover rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-surface-hover rounded w-3/4"></div>
                    <div className="h-3 bg-surface-hover rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : !stats || stats.recentActivity.length === 0 ? (
              <p className="text-center py-8 text-text-tertiary italic text-sm">
                No recent activity detected.
              </p>
            ) : (
              stats?.recentActivity.map((entry: RecentActivity, i: number) => {
                return (
                  <div key={i} className="flex gap-4 group">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border border-border group-hover:scale-110 transition-transform ${
                        entry.type === 'success'
                          ? 'bg-success-bg text-success'
                          : entry.type === 'error'
                            ? 'bg-error-bg text-error'
                            : 'bg-accent-light text-accent-primary'
                      }`}
                    >
                      {entry.type === 'success' ? (
                        <ShieldCheck size={16} />
                      ) : entry.type === 'error' ? (
                        <AlertCircle size={16} />
                      ) : (
                        <Plus size={16} />
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm text-text-primary leading-tight">
                        <span className="font-bold">{entry.action}</span> for{' '}
                        <b className="text-accent-primary">{entry.agent}</b>
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
                        <Clock size={12} />
                        <span>{entry.meta}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="mt-auto p-lg border-t border-border">
            <Link
              to="/audit-logs"
              className="text-accent-primary font-bold text-sm hover:underline flex items-center gap-1"
            >
              View All Logs <ChevronRight size={16} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
