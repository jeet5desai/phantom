import { useState, useEffect, useCallback } from 'react';
import { useRequest } from '@/hooks/useRequest';
import {
  Search,
  Plus,
  Bot,
  Zap,
  Cpu,
  RefreshCw,
  Rocket,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Download,
  Trash2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
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

export default function Agents() {
  const request = useRequest();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newPrivateKey, setNewPrivateKey] = useState('');
  const [newAgentName, setNewAgentName] = useState('');
  const [keyCopied, setKeyCopied] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    agentId: string | null;
    agentName: string;
  }>({
    isOpen: false,
    agentId: null,
    agentName: '',
  });

  // Form state
  const [formName, setFormName] = useState('');
  const [formModel, setFormModel] = useState('GPT-4o');
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [customModelName, setCustomModelName] = useState('');
  const [metadataTags, setMetadataTags] = useState<{ key: string; value: string }[]>([]);

  const handleAddTag = () => setMetadataTags([...metadataTags, { key: '', value: '' }]);
  const handleRemoveTag = (index: number) =>
    setMetadataTags(metadataTags.filter((_, i) => i !== index));
  const handleUpdateTag = (index: number, field: 'key' | 'value', value: string) => {
    const newTags = [...metadataTags];
    newTags[index][field] = value;
    setMetadataTags(newTags);
  };

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'revoked'>('all');

  const fetchAgents = useCallback(async () => {
    const data = await request('GET', '/api/v1/agents?includeRevoked=true');
    if (data && data.agents) {
      setAgents(data.agents);
    }
    setLoading(false);
  }, [request]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAgents();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchAgents]);

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const modelToDeploy = isCustomModel ? customModelName.trim() : formModel;
    if (!modelToDeploy) return;

    // Convert tags array to object
    const metadata: Record<string, string> = {};
    metadataTags.forEach((tag) => {
      if (tag.key.trim()) {
        metadata[tag.key.trim()] = tag.value.trim();
      }
    });

    setCreating(true);
    try {
      const result = await request('POST', '/api/v1/agents', {
        name: formName.trim(),
        model: modelToDeploy,
        metadata,
      });

      if (result?.agent) {
        setShowCreateModal(false);
        setNewAgentName(result.agent.name);
        setNewPrivateKey(result.privateKey || '');
        setShowKeyModal(true);
        setKeyCopied(false);
        fetchAgents();
      }
    } catch {
      // Error is handled by request hook
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAgent = (agentId: string, agentName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmDelete({
      isOpen: true,
      agentId,
      agentName,
    });
  };

  const executeDelete = async () => {
    if (!confirmDelete.agentId) return;

    const result = await request('DELETE', `/api/v1/agents/${confirmDelete.agentId}`);
    if (result?.success) {
      fetchAgents();
    }
  };

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.model.toLowerCase().includes(searchTerm.toLowerCase());

    const isRevoked = agent.status === 'REVOKED';
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && !isRevoked) ||
      (statusFilter === 'revoked' && isRevoked);

    return matchesSearch && matchesStatus;
  });

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
          <p className="text-text-secondary text-lg">
            Manage and monitor your deployed AI agents and their permissions.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setLoading(true);
              fetchAgents();
            }}
            className="p-3 bg-surface-hover border border-border rounded-md text-text-secondary hover:text-accent-primary transition-colors"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            className="btn-primary flex items-center gap-2 "
            onClick={() => {
              setShowCreateModal(true);
              setFormName('');
              setFormModel('GPT-4o');
              setIsCustomModel(false);
              setCustomModelName('');
              setMetadataTags([]);
            }}
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-text-primary w-full text-sm placeholder:text-text-tertiary"
          />
        </div>
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'revoked')}
            className="bg-background border border-border rounded-md text-sm font-bold text-text-secondary px-4 py-2 outline-none cursor-pointer hover:bg-surface-hover transition-colors"
          >
            <option value="all">Status: All</option>
            <option value="active">Active Only</option>
            <option value="revoked">Revoked Only</option>
          </select>
          <span className="text-xs font-bold text-text-tertiary bg-surface-hover px-3 py-2 rounded-md border border-border">
            {filteredAgents.length} showing
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
          {filteredAgents.map((agent) => {
            const isRevoked = agent.status === 'REVOKED';
            return (
              <Link
                key={agent.id}
                to={`/agents/${agent.id}`}
                className={`glass p-lg flex flex-col gap-6 hover:border-accent-primary transition-all duration-300 group cursor-pointer relative ${isRevoked ? 'opacity-75 grayscale-[0.5]' : ''}`}
              >
                {/* Delete Icon Button */}
                <button
                  onClick={(e) => handleDeleteAgent(agent.id, agent.name, e)}
                  className="absolute top-5 right-5 p-2 text-text-tertiary hover:text-error hover:bg-error-bg rounded-md transition-all opacity-0 group-hover:opacity-100 z-20"
                  title="Delete Agent"
                >
                  <Trash2 size={16} />
                </button>

                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-accent-light rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Bot size={28} className="text-accent-primary" />
                  </div>
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 bg-background border border-border rounded-full mr-10`}
                  >
                    {agent.status === 'ACTIVE' && (
                      <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                    )}
                    {agent.status === 'PAUSED' && (
                      <span className="w-2 h-2 rounded-full bg-warning"></span>
                    )}
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        agent.status === 'REVOKED'
                          ? 'text-error'
                          : agent.status === 'PAUSED'
                            ? 'text-warning'
                            : 'text-text-secondary'
                      }`}
                    >
                      {agent.status}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <h3 className="text-xl font-display font-bold group-hover:text-accent-primary transition-colors">
                    {agent.name}
                  </h3>
                  <span className="text-xs font-mono text-text-tertiary tracking-tight">
                    {agent.id}
                  </span>

                  <div className="flex flex-col gap-2 mt-4">
                    <div className="flex items-center gap-3 text-sm text-text-secondary">
                      <Cpu size={14} className="text-text-tertiary" />
                      <span className="font-medium">Model:</span>
                      <span className="font-bold text-text-primary">{agent.model}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-text-secondary">
                      <Zap size={14} className="text-text-tertiary" />
                      <span className="font-medium">Created:</span>
                      <span className="font-bold text-text-primary">
                        {new Date(agent.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {Object.keys(agent.metadata || {}).map((key) => (
                      <span
                        key={key}
                        className="px-3 py-1 bg-surface-hover border border-border rounded-md text-[11px] font-bold text-text-secondary"
                      >
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
              Provision a new secure identity for your AI assistant. This identity will be used for
              all governed actions.
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

            <div className="flex flex-col gap-2">
              <label className="label">Base Model</label>
              <select
                value={isCustomModel ? 'custom' : formModel}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'custom') {
                    setIsCustomModel(true);
                  } else {
                    setIsCustomModel(false);
                    setFormModel(val);
                  }
                }}
                className="w-full px-4 py-3 bg-background border border-border rounded-md outline-none focus:border-accent-primary transition-colors text-sm font-medium appearance-none cursor-pointer"
              >
                <option value="GPT-4o">GPT-4o</option>
                <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                <option value="GPT-4 Turbo">GPT-4 Turbo</option>
                <option value="Llama 3 70B">Llama 3 70B</option>
                <option value="custom">Custom...</option>
              </select>
            </div>

            {isCustomModel && (
              <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="label">Custom Model Name</label>
                <input
                  type="text"
                  placeholder="e.g. mistral-large-latest"
                  value={customModelName}
                  onChange={(e) => setCustomModelName(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-md outline-none focus:border-accent-primary transition-colors text-sm font-medium placeholder:text-text-tertiary"
                  required
                />
              </div>
            )}

            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <label className="label">Metadata Tags</label>
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="text-[11px] font-bold text-accent-primary hover:text-accent-secondary flex items-center gap-1 transition-colors"
                >
                  <Plus size={14} />
                  Add Tag
                </button>
              </div>

              {metadataTags.length > 0 && (
                <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto pr-1">
                  {metadataTags.map((tag, index) => (
                    <div
                      key={index}
                      className="flex gap-2 animate-in fade-in zoom-in-95 duration-200"
                    >
                      <input
                        type="text"
                        placeholder="Key"
                        value={tag.key}
                        onChange={(e) => handleUpdateTag(index, 'key', e.target.value)}
                        className="flex-1 px-3 py-2 bg-background border border-border rounded-md outline-none focus:border-accent-primary text-xs font-medium"
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        value={tag.value}
                        onChange={(e) => handleUpdateTag(index, 'value', e.target.value)}
                        className="flex-1 px-3 py-2 bg-background border border-border rounded-md outline-none focus:border-accent-primary text-xs font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(index)}
                        className="p-2 text-text-tertiary hover:text-error transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {metadataTags.length === 0 && (
                <p className="text-[11px] text-text-tertiary italic">
                  No tags added. Use metadata for custom labels or internal tracking.
                </p>
              )}
            </div>

            <div className="p-4 bg-accent-light rounded-lg flex gap-3 items-start border border-accent-primary/10">
              <Rocket size={18} className="text-accent-primary mt-0.5 shrink-0" />
              <p className="text-xs text-text-secondary leading-relaxed">
                A unique cryptographic identity will be generated in the Phantom HSM for secure,
                governed execution.
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
              <button type="submit" className="btn-primary" disabled={creating}>
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
              Agent <strong>{newAgentName}</strong> was created successfully. Copy or download the
              private key now — <strong>it will not be shown again</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="p-4 bg-error-bg border border-error/20 rounded-xl flex gap-3 items-start">
              <AlertTriangle size={18} className="text-error shrink-0 mt-0.5" />
              <p className="text-xs text-error leading-relaxed font-medium">
                This private key is shown only once. If you close this dialog without saving it, you
                will need to rotate the agent&apos;s credentials to generate a new key.
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

      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ ...confirmDelete, isOpen: false })}
        onConfirm={executeDelete}
        title="Delete Agent Permanently"
        description={`Are you sure you want to PERMANENTLY DELETE "${confirmDelete.agentName}"? This will remove all logs and history associated with this agent. This action is irreversible.`}
        confirmText="Delete Permanently"
        variant="danger"
      />
    </div>
  );
}
