"use client";

import { useState, useEffect } from "react";
import {
  Key,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  Trash2,
  Ban,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/api";

interface ApiKeyItem {
  id: string;
  name: string;
  key_prefix: string;
  last_used_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

function formatTime(dateStr: string) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formName, setFormName] = useState("");
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchKeys = async () => {
    setLoading(true);
    const data = await apiRequest("GET", "/api/v1/api-keys");
    if (data?.apiKeys) setApiKeys(data.apiKeys);
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const data = await apiRequest("GET", "/api/v1/api-keys");
      if (mounted && data?.apiKeys) setApiKeys(data.apiKeys);
      if (mounted) setLoading(false);
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    setSubmitting(true);
    const result = await apiRequest("POST", "/api/v1/api-keys", { name: formName.trim() });
    if (result?.rawKey) {
      setRevealedKey(result.rawKey);
      setFormName("");
      setShowCreateModal(false);
      fetchKeys();
    }
    setSubmitting(false);
  };

  const handleRevoke = async (keyId: string, keyName: string) => {
    if (!window.confirm(`Revoke "${keyName}"? SDK clients using this key will stop working.`)) return;
    await apiRequest("POST", `/api/v1/api-keys/${keyId}/revoke`);
    fetchKeys();
  };

  const handleDelete = async (keyId: string, keyName: string) => {
    if (!window.confirm(`Delete "${keyName}"? This cannot be undone.`)) return;
    await apiRequest("DELETE", `/api/v1/api-keys/${keyId}`);
    fetchKeys();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeKeys = apiKeys.filter((k) => !k.revoked_at);
  const revokedKeys = apiKeys.filter((k) => k.revoked_at);

  return (
    <div className="flex flex-col gap-lg fade-in">
      <div className="flex justify-between items-end mb-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-display font-bold">API Keys</h1>
          <p className="text-text-secondary text-lg">Create and manage API keys for SDK authentication.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchKeys} className="p-3 bg-surface-hover border border-border rounded-md text-text-secondary hover:text-accent-primary transition-colors">
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <button className="btn-primary flex items-center gap-2" onClick={() => { setShowCreateModal(true); setFormName(""); }}>
            <Plus size={20} />
            <span>Create API Key</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        <div className="glass p-lg flex flex-col gap-2">
          <span className="label">Total Keys</span>
          <span className="text-3xl font-display font-bold">{apiKeys.length}</span>
        </div>
        <div className="glass p-lg flex flex-col gap-2">
          <span className="label">Active</span>
          <span className="text-3xl font-display font-bold text-success">{activeKeys.length}</span>
        </div>
        <div className="glass p-lg flex flex-col gap-2">
          <span className="label">Revoked</span>
          <span className="text-3xl font-display font-bold text-warning">{revokedKeys.length}</span>
        </div>
      </div>
      <div className="glass overflow-hidden flex flex-col">
        <div className="px-lg py-5 border-b border-border flex items-center gap-3 bg-surface">
          <Key size={20} className="text-text-secondary" />
          <h3 className="text-xl font-display font-bold">Your API Keys</h3>
        </div>

        {loading && apiKeys.length === 0 ? (
          <div className="p-lg flex justify-center">
            <RefreshCw size={24} className="animate-spin text-accent-primary" />
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="p-lg flex flex-col items-center gap-4 py-16">
            <Key size={48} className="text-text-tertiary" />
            <p className="text-text-secondary text-sm">No API keys yet. Create one to start using the SDK.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="px-lg py-4 label text-[10px]">Name</th>
                  <th className="px-lg py-4 label text-[10px]">Key</th>
                  <th className="px-lg py-4 label text-[10px]">Status</th>
                  <th className="px-lg py-4 label text-[10px]">Created</th>
                  <th className="px-lg py-4 label text-[10px]">Last Used</th>
                  <th className="px-lg py-4 label text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {apiKeys.map((k) => {
                  const isRevoked = !!k.revoked_at;
                  return (
                    <tr key={k.id} className="group hover:bg-background transition-colors">
                      <td className="px-lg py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-surface-hover rounded-lg flex items-center justify-center border border-border text-text-secondary group-hover:bg-accent-light group-hover:text-accent-primary transition-colors">
                            <Key size={20} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-text-primary">{k.name}</span>
                            <span className="text-xs font-mono text-text-tertiary">{k.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-lg py-5">
                        <span className="text-xs font-mono px-3 py-1 bg-surface-hover border border-border rounded-md text-text-secondary">{k.key_prefix}</span>
                      </td>
                      <td className="px-lg py-5">
                        {isRevoked ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-error-bg text-error">
                            <ShieldAlert size={14} />
                            <span>Revoked</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-success-bg text-success">
                            <ShieldCheck size={14} />
                            <span>Active</span>
                          </div>
                        )}
                      </td>
                      <td className="px-lg py-5">
                        <span className="text-sm text-text-secondary">{formatTime(k.created_at)}</span>
                      </td>
                      <td className="px-lg py-5">
                        <span className="text-sm text-text-secondary">{k.last_used_at ? formatTime(k.last_used_at) : "Never"}</span>
                      </td>
                      <td className="px-lg py-5 text-right">
                        <div className="flex justify-end gap-2">
                          {!isRevoked && (
                            <button onClick={() => handleRevoke(k.id, k.name)} className="p-2 border border-border rounded-md text-text-tertiary hover:bg-warning/10 hover:text-warning transition-all" title="Revoke">
                              <Ban size={16} />
                            </button>
                          )}
                          <button onClick={() => handleDelete(k.id, k.name)} className="p-2 border border-border rounded-md text-text-tertiary hover:bg-error-bg hover:text-error transition-all" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Revealed key dialog — shown once after creation */}
      <Dialog isOpen={!!revealedKey} onClose={() => setRevealedKey(null)}>
        <DialogContent>
          <DialogClose onClick={() => setRevealedKey(null)} />
          <DialogHeader>
            <div className="w-12 h-12 bg-accent-light rounded-xl flex items-center justify-center mb-2">
              <ShieldCheck size={28} className="text-accent-primary" />
            </div>
            <DialogTitle>API Key Created</DialogTitle>
            <DialogDescription>Copy this key now. It will not be shown again.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 bg-background border border-border rounded-md px-4 py-3 font-mono text-sm break-all">
            <span className="flex-1 select-all">{revealedKey}</span>
            <button onClick={() => revealedKey && copyToClipboard(revealedKey)} className="shrink-0 p-2 hover:bg-surface-hover rounded-md transition-colors" title="Copy">
              {copied ? <Check size={16} className="text-success" /> : <Copy size={16} className="text-text-tertiary" />}
            </button>
          </div>
          <div className="p-4 bg-warning/10 rounded-xl flex gap-4 items-start border border-warning/20">
            <AlertCircle size={20} className="text-warning shrink-0 mt-0.5" />
            <p className="text-xs text-text-secondary leading-relaxed">Store this key in a secure location like a secrets manager. You will not be able to see it again.</p>
          </div>
          <DialogFooter>
            <button className="btn-primary px-8" onClick={() => setRevealedKey(null)}>Done</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create key dialog */}
      <Dialog isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <DialogContent>
          <DialogClose onClick={() => setShowCreateModal(false)} />
          <DialogHeader>
            <div className="w-12 h-12 bg-accent-light rounded-xl flex items-center justify-center mb-2">
              <Key size={28} className="text-accent-primary" />
            </div>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>Give your key a name so you can identify it later.</DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-6" onSubmit={handleCreate}>
            <div className="flex flex-col gap-2">
              <label className="label">Key Name</label>
              <input type="text" placeholder="e.g. Production, CI/CD, Local Dev" value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full px-4 py-3 bg-background border border-border rounded-md outline-none focus:border-accent-primary transition-colors text-sm font-medium" required />
            </div>
            <DialogFooter>
              <button type="button" className="px-6 py-3 font-bold text-text-secondary hover:bg-surface-hover rounded-md transition-colors" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button type="submit" className="btn-primary px-8" disabled={submitting}>{submitting ? "Creating..." : "Create Key"}</button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
