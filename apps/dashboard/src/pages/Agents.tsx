

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { 
  Search, 
  Filter, 
  Plus, 
  ExternalLink,
  Settings,
  Bot,
  Zap,
  Cpu,
  RefreshCw,
  Rocket,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Download
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter, 
  DialogClose 
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";

interface Agent {
  id: string;
  name: string;
  model: string;
  created_at: string;
  revoked_at?: string | null;
  metadata?: Record<string, string>;
}

export default function Agents() {
  const { getToken } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newPrivateKey, setNewPrivateKey] = useState('');
  const [newAgentName, setNewAgentName] = useState('');
  const [keyCopied, setKeyCopied] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formModel, setFormModel] = useState('GPT-4o');

  const fetchAgents = async () => {
    setLoading(true);
    const token = await getToken();
    const data = await apiRequest('GET', '/api/v1/agents', undefined, token || undefined);
    if (data && data.agents) {
      setAgents(data.agents);
    }
    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;
    const loadAgents = async () => {
      setLoading(true);
      const token = await getToken();
      const data = await apiRequest('GET', '/api/v1/agents', undefined, token || undefined);
      if (isMounted && data?.agents) {
        setAgents(data.agents);
      }
      if (isMounted) setLoading(false);
    };

    loadAgents();
    return () => { isMounted = false; };
  }, []);

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setCreating(true);
    const token = await getToken();
    const result = await apiRequest('POST', '/api/v1/agents', {
      name: formName.trim(),
      model: formModel,
    }, token || undefined);

    if (result?.agent) {
      setShowCreateModal(false);
      setNewAgentName(result.agent.name);
      setNewPrivateKey(result.privateKey || '');
      setShowKeyModal(true);
      setKeyCopied(false);
      // Refresh agent list
      fetchAgents();
    }
    setCreating(false);
  };

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(newPrivateKey);
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 3000);
    } catch {
      // Fallback for non-HTTPS contexts
      const textarea = document.createElement('textarea');
      textarea.value = newPrivateKey;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 3000);
    }
  };

  const handleDownloadKey = () => {
    const blob = new Blob([newPrivateKey], { type: 'application/x-pem-file' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${newAgentName.replace(/[^a-zA-Z0-9-_]/g, '_')}_private_key.pem`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-lg fade-in">
      <div className="flex justify-between items-end mb-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-display font-bold">AI Agents</h1>
          <p className="text-text-secondary text-lg">Manage and monitor your deployed AI agents and their permissions.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchAgents}
            className="p-3 bg-surface-hover border border-border rounded-md text-text-secondary hover:text-accent-primary transition-colors"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            className="btn-primary flex items-center gap-2 "
            onClick={() => { setShowCreateModal(true); setFormName(''); setFormModel('GPT-4o'); }}
          >
            <Plus size={20} />
            <span>Create New Agent</span>
          </button>
        </div>
      </div>

      <div className="glass flex justify-between items-center px-lg py-4">
        <div className="flex items-center gap-3 flex-1">
          <Search size={18} className="text-text-tertiary" />
          <input 
            type="text" 
            placeholder="Filter agents by name, ID or model..." 
            className="bg-transparent border-none outline-none text-text-primary w-full text-sm placeholder:text-text-tertiary"
          />
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-md text-sm font-bold text-text-secondary hover:bg-surface-hover transition-colors">
            <Filter size={16} />
            Status: All
          </button>
          <span className="text-xs font-bold text-text-tertiary bg-surface-hover px-3 py-2 rounded-md border border-border">
            {agents.length} Total
          </span>
        </div>
      </div>

      {loading && agents.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-lg">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass h-[280px] animate-pulse bg-surface-hover/50"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-lg">
          {agents.map((agent) => {
            const isRevoked = !!agent.revoked_at;
            return (
              <Link key={agent.id} to={`/agents/${agent.id}`} className="glass p-lg flex flex-col gap-6 hover:border-accent-primary transition-all duration-300 group cursor-pointer">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-accent-light rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Bot size={28} className="text-accent-primary" />
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-full `}>
                    {!isRevoked && <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>}
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isRevoked ? 'text-error' : 'text-text-secondary'}`}>
                      {isRevoked ? 'Revoked' : 'Active'}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-xl font-display font-bold group-hover:text-accent-primary transition-colors">{agent.name}</h3>
                  <span className="text-xs font-mono text-text-tertiary tracking-tight">{agent.id}</span>
                  
                  <div className="flex flex-col gap-2 mt-4">
                    <div className="flex items-center gap-3 text-sm text-text-secondary">
                      <Cpu size={14} className="text-text-tertiary" />
                      <span className="font-medium">Model:</span>
                      <span className="font-bold text-text-primary">{agent.model}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-text-secondary">
                      <Zap size={14} className="text-text-tertiary" />
                      <span className="font-medium">Created:</span>
                      <span className="font-bold text-text-primary">{new Date(agent.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    {Object.keys(agent.metadata || {}).map((key) => (
                      <span key={key} className="px-3 py-1 bg-surface-hover border border-border rounded-md text-[11px] font-bold text-text-secondary">
                        {key}: {agent.metadata![key]}
                      </span>
                    ))}
                    {(!agent.metadata || Object.keys(agent.metadata).length === 0) && (
                      <span className="px-3 py-1 bg-surface-hover border border-border rounded-md text-[11px] font-bold text-text-tertiary italic">
                        No metadata
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-border">
                  <button className="flex items-center justify-center gap-2 py-2 border border-border rounded-md text-sm font-bold text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all">
                    <ExternalLink size={14} />
                    Logs
                  </button>
                  <button className="flex items-center justify-center gap-2 py-2 border border-border rounded-md text-sm font-bold text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all">
                    <Settings size={14} />
                    Settings
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create Agent Dialog */}
      <Dialog isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <DialogContent>
          <DialogClose onClick={() => setShowCreateModal(false)} />
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-light rounded-lg flex items-center justify-center">
                <Bot size={22} className="text-accent-primary" />
              </div>
              <div>
                <DialogTitle>Create New Agent</DialogTitle>
              </div>
            </div>
            <DialogDescription>
              Provision a new secure identity for your AI assistant. This identity will be used for all governed actions.
            </DialogDescription>
          </DialogHeader>

          <form className="flex flex-col gap-lg" onSubmit={handleCreateAgent}>
            <div className="flex flex-col gap-2">
              <label className="label">Agent Name</label>
              <input
                type="text"
                placeholder="e.g. gmail-assistant"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-md outline-none focus:border-accent-primary transition-colors text-sm font-medium placeholder:text-text-tertiary"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="label">Base Model</label>
                <select 
                  value={formModel}
                  onChange={(e) => setFormModel(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-md outline-none focus:border-accent-primary transition-colors text-sm font-medium appearance-none cursor-pointer"
                >
                  <option>GPT-4o</option>
                  <option>Claude 3.5 Sonnet</option>
                  <option>GPT-4 Turbo</option>
                  <option>Llama 3 70B</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="label">Agent Role</label>
                <select className="w-full px-4 py-3 bg-background border border-border rounded-md outline-none focus:border-accent-primary transition-colors text-sm font-medium appearance-none cursor-pointer">
                  <option>Autonomous</option>
                  <option>Human-Guided</option>
                  <option>Data Scrubber</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-accent-light rounded-lg flex gap-3 items-start border border-accent-primary/10">
              <Rocket size={18} className="text-accent-primary mt-0.5 shrink-0" />
              <p className="text-xs text-text-secondary leading-relaxed">
                A unique cryptographic identity will be generated in the AgentKey HSM for secure, governed execution.
              </p>
            </div>

            <DialogFooter>
              <button
                type="button"
                className="btn-outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={creating}
              >
                {creating ? 'Deploying...' : 'Deploy Agent'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Private Key One-Time Reveal Dialog */}
      <Dialog isOpen={showKeyModal} onClose={() => setShowKeyModal(false)}>
        <DialogContent className="max-w-[600px]">
          <DialogClose onClick={() => setShowKeyModal(false)} />
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-warning-bg rounded-xl flex items-center justify-center">
                <AlertTriangle size={28} className="text-warning" />
              </div>
              <div>
                <DialogTitle>Save Your Private Key</DialogTitle>
              </div>
            </div>
            <DialogDescription>
              Agent <strong>{newAgentName}</strong> was created successfully. Copy or download the private key now — <strong>it will not be shown again</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="p-4 bg-error-bg border border-error/20 rounded-xl flex gap-3 items-start">
              <AlertTriangle size={18} className="text-error shrink-0 mt-0.5" />
              <p className="text-xs text-error leading-relaxed font-medium">
                This private key is shown only once. If you close this dialog without saving it, you will need to rotate the agent&apos;s credentials to generate a new key.
              </p>
            </div>

            <div className="relative">
              <pre className="p-4 bg-background border border-border rounded-lg text-xs font-mono text-text-secondary overflow-x-auto whitespace-pre-wrap break-all max-h-[200px] overflow-y-auto">
                {newPrivateKey}
              </pre>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCopyKey}
                className={`flex-1 flex items-center justify-center gap-2 py-3 border rounded-md text-sm font-bold transition-all ${
                  keyCopied 
                    ? 'bg-success-bg border-success/30 text-success' 
                    : 'border-border text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                }`}
              >
                {keyCopied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                {keyCopied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
              <button
                onClick={handleDownloadKey}
                className="flex-1 flex items-center justify-center gap-2 py-3 border border-border rounded-md text-sm font-bold text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all"
              >
                <Download size={16} />
                Download .pem
              </button>
            </div>
          </div>

          <DialogFooter>
            <button
              type="button"
              className="btn-primary w-full"
              onClick={() => setShowKeyModal(false)}
            >
              I&apos;ve Saved My Key
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
