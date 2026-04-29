import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useRequest } from '@/hooks/useRequest';
import {
  ChevronLeft,
  Bot,
  ExternalLink,
  Pause,
  Play,
  AlertTriangle,
  Settings,
  Cpu,
  Clock,
  Shield,
  Calendar,
  Trash2,
} from 'lucide-react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface Agent {
  id: string;
  name: string;
  model: string;
  status: 'ACTIVE' | 'PAUSED' | 'REVOKED';
  createdAt: string;
  revokedAt?: string | null;
  metadata?: Record<string, string>;
}

export default function AgentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const request = useRequest();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);

  const [confirmRevoke, setConfirmRevoke] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!id) return;
      setLoading(true);
      const data = await request('GET', `/api/v1/agents/${id}`);
      if (mounted && data?.agent) setAgent(data.agent);
      if (mounted) setLoading(false);
    };
    load();
    return () => {
      mounted = false;
    };
  }, [id, request]);

  const handlePause = async () => {
    const result = await request('POST', `/api/v1/agents/${id}/pause`);
    if (result?.agent) setAgent(result.agent);
  };

  const handleResume = async () => {
    const result = await request('POST', `/api/v1/agents/${id}/resume`);
    if (result?.agent) setAgent(result.agent);
  };

  const handleRevoke = async () => {
    const result = await request('POST', `/api/v1/agents/${id}/revoke`);
    if (result?.agent) {
      setConfirmRevoke(false);
      setAgent(result.agent);
    }
  };

  const handleDelete = async () => {
    const result = await request('DELETE', `/api/v1/agents/${id}`);
    if (result?.success) {
      navigate('/agents');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-text-secondary">Agent not found or access denied.</p>
        <Link to="/agents" className="btn-outline">
          Back to Agents
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-lg max-w-5xl mx-auto py-8 px-6 fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link
          to="/agents"
          className="flex items-center gap-2 text-sm text-text-tertiary hover:text-text-primary transition-colors w-fit"
        >
          <ChevronLeft size={16} />
          Back to Agents
        </Link>

        <div className="flex justify-between items-start">
          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 bg-accent-light rounded-2xl flex items-center justify-center">
              <Bot size={32} className="text-accent-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text-primary tracking-tight">{agent.name}</h1>
              <p className="text-sm font-mono text-text-tertiary mt-1">{agent.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-full shadow-sm">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                agent.status === 'ACTIVE'
                  ? 'bg-success animate-pulse'
                  : agent.status === 'PAUSED'
                    ? 'bg-warning'
                    : 'bg-error'
              }`}
            ></span>
            <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">
              {agent.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Quick Actions */}
          <div className="glass p-8">
            <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
              <Settings size={20} className="text-accent-primary" />
              Management Actions
            </h3>
            <div className="flex items-center justify-between gap-3">
              {agent.status === 'ACTIVE' && (
                <button
                  onClick={handlePause}
                  className="w-full flex items-center gap-3 p-3 bg-warning/5 border border-warning/20 rounded-lg hover:bg-warning/10 transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center text-warning group-hover:scale-110 transition-transform">
                    <Pause size={16} />
                  </div>
                  <span className="text-xs font-bold text-warning">Stop</span>
                </button>
              )}

              {agent.status === 'PAUSED' && (
                <button
                  onClick={handleResume}
                  className="w-full flex items-center gap-3 p-3 bg-success/5 border border-success/20 rounded-lg hover:bg-success/10 transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center text-success group-hover:scale-110 transition-transform">
                    <Play size={16} />
                  </div>
                  <span className="text-xs font-bold text-success">Start</span>
                </button>
              )}

              <button className="w-full flex items-center gap-3 p-3 bg-surface-hover border border-border rounded-lg hover:bg-background transition-all group">
                <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center text-accent-primary group-hover:scale-110 transition-transform">
                  <ExternalLink size={16} />
                </div>
                <span className="text-xs font-bold text-text-primary">Logs</span>
              </button>

              {agent.status !== 'REVOKED' && (
                <button
                  onClick={() => setConfirmRevoke(true)}
                  className="w-full flex items-center gap-3 p-3 bg-error/5 border border-error/20 rounded-lg hover:bg-error/10 transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-error/10 flex items-center justify-center text-error group-hover:scale-110 transition-transform">
                    <AlertTriangle size={16} />
                  </div>
                  <span className="text-xs font-bold text-error">Revoke</span>
                </button>
              )}
            </div>
          </div>

          {/* Metadata Section */}
          <div className="glass p-8">
            <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
              <Shield size={20} className="text-accent-primary" />
              Agent Metadata & Tags
            </h3>
            {agent.metadata && Object.keys(agent.metadata).length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(agent.metadata).map(([key, value]) => (
                  <div key={key} className="p-4 bg-background border border-border rounded-lg">
                    <span className="block text-[10px] uppercase tracking-wider text-text-tertiary font-bold mb-1">
                      {key}
                    </span>
                    <span className="text-sm font-medium text-text-primary">{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center bg-background rounded-xl border border-dashed border-border">
                <p className="text-sm text-text-tertiary italic">
                  No metadata configured for this agent.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="flex flex-col gap-lg">
          <div className="glass p-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-text-tertiary mb-4">
              Agent Configuration
            </h4>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Cpu size={18} className="text-text-tertiary" />
                <div>
                  <p className="text-[11px] text-text-tertiary leading-none">Model</p>
                  <p className="text-sm font-bold text-text-primary">{agent.model}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-text-tertiary" />
                <div>
                  <p className="text-[11px] text-text-tertiary leading-none">Created</p>
                  <p className="text-sm font-bold text-text-primary">
                    {new Date(agent.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-text-tertiary" />
                <div>
                  <p className="text-[11px] text-text-tertiary leading-none">Uptime State</p>
                  <p className="text-sm font-bold text-text-primary">
                    {agent.status === 'ACTIVE' ? 'Running' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass p-6 border-error/20 bg-error/5">
            <h4 className="text-xs font-bold uppercase tracking-widest text-error/60 mb-4">
              Danger Zone
            </h4>
            <p className="text-[11px] text-text-tertiary mb-4 leading-relaxed">
              Deleting an agent is permanent and will wipe all associated governance logs. This
              cannot be undone.
            </p>
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full flex items-center justify-center gap-2 py-2 border border-error/30 rounded-md text-xs font-bold text-error hover:bg-error-bg transition-all"
            >
              <Trash2 size={14} />
              Delete Permanently
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmRevoke}
        onClose={() => setConfirmRevoke(false)}
        onConfirm={handleRevoke}
        title="Revoke Agent"
        description="Are you sure you want to revoke this agent? It will immediately lose all access and cannot be reactivated."
        confirmText="Revoke Agent"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete Agent Permanently"
        description="This action is irreversible. All agent history and identities will be destroyed."
        confirmText="Delete Permanently"
        variant="danger"
      />
    </div>
  );
}
