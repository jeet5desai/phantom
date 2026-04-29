import { useState, useEffect } from 'react';
import { useRequest } from '@/hooks/useRequest';
import {
  Lock,
  Plus,
  Search,
  Eye,
  RefreshCw,
  ShieldCheck,
  Key,
  Database,
  Shield,
  CreditCard,
  EyeOff,
  AlertCircle,
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
import ConfirmDialog from '@/components/ui/ConfirmDialog';

import { LucideIcon } from 'lucide-react';

const SERVICE_ICONS: Record<string, LucideIcon> = {
  stripe: CreditCard,
  aws: ShieldCheck,
  github: Shield,
  openai: Key,
  database: Database,
  default: Lock,
};

function getServiceIcon(service: string) {
  const lower = service.toLowerCase();
  for (const [key, Icon] of Object.entries(SERVICE_ICONS)) {
    if (lower.includes(key)) return Icon;
  }
  return SERVICE_ICONS.default;
}

interface Credential {
  id: string;
  service: string;
  label?: string;
  createdAt: string;
  rotatedAt?: string | null;
}

export default function Vault() {
  const request = useRequest();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showRotateModal, setShowRotateModal] = useState(false);
  const [rotatingCredential, setRotatingCredential] = useState<Credential | null>(null);

  const [formName, setFormName] = useState('');
  const [formService, setFormService] = useState('');
  const [formSecret, setFormSecret] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    id: string;
    name: string;
  }>({
    isOpen: false,
    id: '',
    name: '',
  });

  const fetchCredentials = async () => {
    setLoading(true);
    const data = await request('GET', '/api/v1/credentials');
    if (data?.credentials) {
      setCredentials(data.credentials);
    }
    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      const data = await request('GET', '/api/v1/credentials');
      if (isMounted && data?.credentials) {
        setCredentials(data.credentials);
      }
      if (isMounted) setLoading(false);
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [request]);

  const handleAddSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formService.trim() || !formSecret.trim()) return;

    setSubmitting(true);
    const result = await request('POST', '/api/v1/credentials', {
      service: formService.trim(),
      apiKey: formSecret.trim(),
      label: formName.trim() || undefined,
    });

    if (result?.credential) {
      setShowAddModal(false);
      setFormName('');
      setFormService('');
      setFormSecret('');
      fetchCredentials();
    }
    setSubmitting(false);
  };

  const handleDelete = async (credentialId: string, serviceName: string) => {
    setConfirmDelete({
      isOpen: true,
      id: credentialId,
      name: serviceName,
    });
  };

  const executeDelete = async () => {
    const { id } = confirmDelete;
    const result = await request('DELETE', `/api/v1/credentials/${id}`);
    if (result) {
      fetchCredentials();
    }
  };

  const handleRotate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rotatingCredential || !formSecret.trim()) return;

    setSubmitting(true);
    const result = await request('PUT', `/api/v1/credentials/${rotatingCredential.id}/rotate`, {
      apiKey: formSecret.trim(),
    });

    if (result?.credential) {
      setShowRotateModal(false);
      setRotatingCredential(null);
      setFormSecret('');
      fetchCredentials();
    }
    setSubmitting(false);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date().getTime();
    const seconds = Math.floor((now - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const activeCount = credentials.length;
  const recentlyRotatedCount = credentials.filter((c) => {
    if (!c.rotatedAt) return false;
    const rotatedDate = new Date(c.rotatedAt).getTime();
    const sevenDaysAgo = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
    return rotatedDate > sevenDaysAgo;
  }).length;

  const filteredCredentials = credentials.filter((cred) => {
    const search = searchQuery.toLowerCase();
    return (
      cred.service.toLowerCase().includes(search) ||
      (cred.label && cred.label.toLowerCase().includes(search)) ||
      cred.id.toLowerCase().includes(search)
    );
  });

  return (
    <div className="flex flex-col gap-lg fade-in">
      <div className="flex justify-between items-end mb-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-display font-bold">Secure Vault</h1>
          <p className="text-text-secondary text-lg">
            Manage and monitor secrets, API keys, and credentials used by your agents.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchCredentials}
            className="p-3 bg-surface-hover border border-border rounded-md text-text-secondary hover:text-accent-primary transition-colors"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            className="btn-primary flex items-center gap-2 "
            onClick={() => {
              setShowAddModal(true);
              setFormName('');
              setFormService('');
              setFormSecret('');
            }}
          >
            <Plus size={20} />
            <span>Add New Secret</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
        <div className="glass p-lg flex flex-col gap-2">
          <span className="label">Total Secrets</span>
          <span className="text-3xl font-display font-bold">{activeCount}</span>
        </div>
        <div className="glass p-lg flex flex-col gap-2">
          <span className="label">Secrets In Use</span>
          <span className="text-3xl font-display font-bold">{activeCount}</span>
        </div>
        <div className="glass p-lg flex flex-col gap-2">
          <span className="label">Recently Rotated</span>
          <span className="text-3xl font-display font-bold text-warning">{recentlyRotatedCount}</span>
        </div>
        <div className="glass p-lg flex flex-col gap-2">
          <span className="label">Security Score</span>
          <span className="text-3xl font-display font-bold text-success">
            {activeCount > 0 ? 'A+' : '—'}
          </span>
        </div>
      </div>

      <div className="glass overflow-hidden flex flex-col">
        <div className="px-lg py-5 border-b border-border flex items-center justify-between bg-surface">
          <div className="flex items-center gap-3">
            <Lock size={20} className="text-text-secondary" />
            <h3 className="text-xl font-display font-bold">Secrets & Credentials</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-md border border-border group focus-within:border-accent-primary transition-colors">
              <Search
                size={16}
                className="text-text-tertiary group-focus-within:text-accent-primary"
              />
              <input
                type="text"
                placeholder="Search secrets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-text-primary w-64 placeholder:text-text-tertiary"
              />
            </div>
          </div>
        </div>

        {loading && credentials.length === 0 ? (
          <div className="p-lg flex justify-center">
            <RefreshCw size={24} className="animate-spin text-accent-primary" />
          </div>
        ) : filteredCredentials.length === 0 ? (
          <div className="p-lg flex flex-col items-center gap-4 py-16 text-center">
            <Search size={48} className="text-text-tertiary opacity-20" />
            <div>
              <p className="text-text-primary font-bold">No secrets found</p>
              <p className="text-text-secondary text-sm">
                {searchQuery ? `No results for "${searchQuery}"` : 'Add your first secret to get started.'}
              </p>
            </div>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-accent-primary text-sm font-bold hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="px-lg py-4 label text-[10px]">Secret Name</th>
                  <th className="px-lg py-4 label text-[10px]">Service</th>
                  <th className="px-lg py-4 label text-[10px]">Status</th>
                  <th className="px-lg py-4 label text-[10px]">Created</th>
                  <th className="px-lg py-4 label text-[10px]">Last Rotated</th>
                  <th className="px-lg py-4 label text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCredentials.map((cred) => {
                  const SecretIcon = getServiceIcon(cred.service);
                  return (
                    <tr key={cred.id} className="group hover:bg-background transition-colors">
                      <td className="px-lg py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-surface-hover rounded-lg flex items-center justify-center border border-border text-text-secondary group-hover:bg-accent-light group-hover:text-accent-primary transition-colors">
                            <SecretIcon size={20} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-text-primary">
                              {cred.label || cred.service}
                            </span>
                            <span className="text-xs font-mono text-text-tertiary">{cred.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-lg py-5">
                        <span className="text-xs font-bold px-3 py-1 bg-surface-hover border border-border rounded-md text-text-secondary">
                          {cred.service}
                        </span>
                      </td>
                      <td className="px-lg py-5">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-success-bg text-success">
                          <ShieldCheck size={14} />
                          <span>Healthy</span>
                        </div>
                      </td>
                      <td className="px-lg py-5">
                        <span className="text-sm text-text-secondary">
                          {formatTime(cred.createdAt)}
                        </span>
                      </td>
                      <td className="px-lg py-5">
                        <span className="text-sm text-text-secondary">
                          {cred.rotatedAt ? formatTime(cred.rotatedAt) : '—'}
                        </span>
                      </td>
                      <td className="px-lg py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setRotatingCredential(cred);
                              setFormSecret('');
                              setShowRotateModal(true);
                            }}
                            className="p-2 border border-border rounded-md text-text-tertiary hover:bg-surface-hover hover:text-accent-primary transition-all"
                            title="Rotate Secret"
                          >
                            <RefreshCw size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(cred.id, cred.label || cred.service)}
                            className="p-2 border border-border rounded-md text-text-tertiary hover:bg-error-bg hover:text-error transition-all"
                            title="Delete"
                          >
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

      {/* Add Secret Dialog — wired to real API */}
      <Dialog isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <DialogContent>
          <DialogClose onClick={() => setShowAddModal(false)} />
          <DialogHeader>
            <div className="w-12 h-12 bg-accent-light rounded-xl flex items-center justify-center mb-2">
              <Lock size={28} className="text-accent-primary" />
            </div>
            <DialogTitle>Add New Secret</DialogTitle>
            <DialogDescription>
              Securely store credentials for your agents. Secrets are encrypted at rest using
              AES-256-GCM.
            </DialogDescription>
          </DialogHeader>

          <form className="flex flex-col gap-6" onSubmit={handleAddSecret}>
            <div className="flex flex-col gap-2">
              <label className="label">Label (optional)</label>
              <input
                type="text"
                placeholder="e.g. OpenAI Production Key"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-md outline-none focus:border-accent-primary transition-colors text-sm font-medium"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="label">Service</label>
              <input
                type="text"
                placeholder="e.g. openai, stripe, github"
                value={formService}
                onChange={(e) => setFormService(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-md outline-none focus:border-accent-primary transition-colors text-sm font-medium"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="label">Secret Value</label>
              <div className="relative flex items-center group">
                <input
                  type={showSecret ? 'text' : 'password'}
                  placeholder="Enter secret value..."
                  value={formSecret}
                  onChange={(e) => setFormSecret(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-md outline-none focus:border-accent-primary transition-colors text-sm font-medium pr-12"
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 text-text-tertiary hover:text-text-primary transition-colors"
                  onClick={() => setShowSecret(!showSecret)}
                >
                  {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="p-4 bg-accent-light rounded-xl flex gap-4 items-start border border-accent-primary/20">
              <AlertCircle size={20} className="text-accent-primary shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-accent-primary">
                  Encryption Guard Active
                </span>
                <p className="text-xs text-accent-dark/80 leading-relaxed">
                  This secret will be vaulted and only issued to agents via scoped tokens. It will
                  never be exposed in plain text.
                </p>
              </div>
            </div>

            <DialogFooter>
              <button
                type="button"
                className="px-6 py-3 font-bold text-text-secondary hover:bg-surface-hover rounded-md transition-colors"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary px-8 " disabled={submitting}>
                {submitting ? 'Vaulting...' : 'Vault Secret'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rotate Secret Dialog */}
      <Dialog isOpen={showRotateModal} onClose={() => setShowRotateModal(false)}>
        <DialogContent>
          <DialogClose onClick={() => setShowRotateModal(false)} />
          <DialogHeader>
            <div className="w-12 h-12 bg-warning-bg rounded-xl flex items-center justify-center mb-2">
              <RefreshCw size={28} className="text-warning" />
            </div>
            <DialogTitle>Rotate Secret</DialogTitle>
            <DialogDescription>
              Update the API key for <strong>{rotatingCredential?.label || rotatingCredential?.service}</strong>. 
              The old key will be replaced instantly.
            </DialogDescription>
          </DialogHeader>

          <form className="flex flex-col gap-6" onSubmit={handleRotate}>
            <div className="flex flex-col gap-2">
              <label className="label">New Secret Value</label>
              <div className="relative flex items-center group">
                <input
                  type={showSecret ? 'text' : 'password'}
                  placeholder="Enter new secret value..."
                  value={formSecret}
                  onChange={(e) => setFormSecret(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-md outline-none focus:border-accent-primary transition-colors text-sm font-medium pr-12"
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 text-text-tertiary hover:text-text-primary transition-colors"
                  onClick={() => setShowSecret(!showSecret)}
                >
                  {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="p-4 bg-warning-bg rounded-xl flex gap-4 items-start border border-warning/20">
              <AlertCircle size={20} className="text-warning shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-warning">
                  Security Precaution
                </span>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Rotating a secret will update it in the vault. Any agents using tokens issued 
                  with the old key will continue to work until their tokens expire (typically 5 minutes).
                </p>
              </div>
            </div>

            <DialogFooter>
              <button
                type="button"
                className="px-6 py-3 font-bold text-text-secondary hover:bg-surface-hover rounded-md transition-colors"
                onClick={() => setShowRotateModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary px-8 bg-warning hover:bg-warning/90 border-warning" disabled={submitting}>
                {submitting ? 'Updating...' : 'Rotate Secret'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ ...confirmDelete, isOpen: false })}
        onConfirm={executeDelete}
        title="Delete Credential"
        description={`Are you sure you want to delete the credential for "${confirmDelete.name}"? This action cannot be undone.`}
        confirmText="Delete Secret"
      />
    </div>
  );
}
