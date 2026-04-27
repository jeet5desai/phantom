"use client";

import { useState } from "react";
import { 
  Lock, 
  Plus, 
  Search, 
  Eye, 
  RefreshCw, 
  ShieldCheck, 
  ShieldAlert,
  ShieldEllipsis,
  Key,
  Database,
  Shield,
  CreditCard,
  User,
  EyeOff,
  AlertCircle
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter, 
  DialogClose 
} from "@/components/ui/dialog";

const SECRETS = [
  { id: "sec_9k2m...", name: "Stripe Production Key", type: "API Key", lastUsed: "2m ago", usedBy: "invoice-processor", status: "Healthy", icon: CreditCard },
  { id: "sec_1l8v...", name: "AWS IAM Secret", type: "Credentials", lastUsed: "1h ago", usedBy: "security-auditor", status: "Healthy", icon: ShieldCheck },
  { id: "sec_x39b...", name: "GitHub OAuth Token", type: "OAuth", lastUsed: "2d ago", usedBy: "github-bot", status: "Revoked", icon: Shield },
  { id: "sec_p72r...", name: "OpenAI API Key", type: "API Key", lastUsed: "Just now", usedBy: "email-notifier", status: "Rotating", icon: Key },
  { id: "sec_d44n...", name: "Database URL", type: "Connection String", lastUsed: "5m ago", usedBy: "customer-support", status: "Healthy", icon: Database },
];

export default function VaultPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  return (
    <div className="flex flex-col gap-lg fade-in">
      <div className="flex justify-between items-end mb-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-display font-bold">Secure Vault</h1>
          <p className="text-text-secondary text-lg">Manage and monitor secrets, API keys, and credentials used by your agents.</p>
        </div>
        <button 
          className="btn-primary flex items-center gap-2 shadow-md shadow-accent-primary/20"
          onClick={() => setShowAddModal(true)}
        >
          <Plus size={20} />
          <span>Add New Secret</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
        <div className="glass p-lg flex flex-col gap-2">
          <span className="label">Total Secrets</span>
          <span className="text-3xl font-display font-bold">24</span>
        </div>
        <div className="glass p-lg flex flex-col gap-2">
          <span className="label">Secrets In Use</span>
          <span className="text-3xl font-display font-bold">18</span>
        </div>
        <div className="glass p-lg flex flex-col gap-2">
          <span className="label">Rotation Needed</span>
          <span className="text-3xl font-display font-bold text-warning">3</span>
        </div>
        <div className="glass p-lg flex flex-col gap-2">
          <span className="label">Security Score</span>
          <span className="text-3xl font-display font-bold text-success">A+</span>
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
               <Search size={16} className="text-text-tertiary group-focus-within:text-accent-primary" />
               <input 
                 type="text" 
                 placeholder="Search secrets..." 
                 className="bg-transparent border-none outline-none text-sm text-text-primary w-64 placeholder:text-text-tertiary" 
               />
             </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-background/50">
                <th className="px-lg py-4 label text-[10px]">Secret Name</th>
                <th className="px-lg py-4 label text-[10px]">Type</th>
                <th className="px-lg py-4 label text-[10px]">Status</th>
                <th className="px-lg py-4 label text-[10px]">Last Used</th>
                <th className="px-lg py-4 label text-[10px]">Used By</th>
                <th className="px-lg py-4 label text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {SECRETS.map((secret) => {
                const SecretIcon = secret.icon;
                return (
                  <tr key={secret.id} className="group hover:bg-background transition-colors">
                    <td className="px-lg py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-surface-hover rounded-lg flex items-center justify-center border border-border text-text-secondary group-hover:bg-accent-light group-hover:text-accent-primary transition-colors">
                          <SecretIcon size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-text-primary">{secret.name}</span>
                          <span className="text-xs font-mono text-text-tertiary">{secret.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-lg py-5">
                      <span className="text-xs font-bold px-3 py-1 bg-surface-hover border border-border rounded-md text-text-secondary">
                        {secret.type}
                      </span>
                    </td>
                    <td className="px-lg py-5">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        secret.status === 'Healthy' ? 'bg-success-bg text-success' : 
                        secret.status === 'Revoked' ? 'bg-error-bg text-error' : 
                        'bg-warning-bg text-warning'
                      }`}>
                        {secret.status === 'Healthy' && <ShieldCheck size={14} />}
                        {secret.status === 'Revoked' && <ShieldAlert size={14} />}
                        {secret.status === 'Rotating' && <ShieldEllipsis size={14} />}
                        <span>{secret.status}</span>
                      </div>
                    </td>
                    <td className="px-lg py-5">
                      <span className="text-sm text-text-secondary">{secret.lastUsed}</span>
                    </td>
                    <td className="px-lg py-5">
                      <div className="flex items-center gap-2 text-sm">
                        <User size={14} className="text-text-tertiary" />
                        <span className="font-bold text-accent-primary hover:underline cursor-pointer">{secret.usedBy}</span>
                      </div>
                    </td>
                    <td className="px-lg py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 border border-border rounded-md text-text-tertiary hover:bg-surface-hover hover:text-accent-primary transition-all">
                          <Eye size={16} />
                        </button>
                        <button className="p-2 border border-border rounded-md text-text-tertiary hover:bg-surface-hover hover:text-accent-primary transition-all">
                          <RefreshCw size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proper UI Dialog Implementation */}
      <Dialog isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <DialogContent>
          <DialogClose onClick={() => setShowAddModal(false)} />
          <DialogHeader>
            <div className="w-12 h-12 bg-accent-light rounded-xl flex items-center justify-center mb-2">
               <Lock size={28} className="text-accent-primary" />
            </div>
            <DialogTitle>Add New Secret</DialogTitle>
            <DialogDescription>
              Securely store credentials for your agents. Secrets are encrypted at rest using industry-standard HSMs.
            </DialogDescription>
          </DialogHeader>
          
          <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-col gap-2">
              <label className="label">Secret Name</label>
              <input 
                type="text" 
                placeholder="e.g. OpenAI API Key" 
                className="w-full px-4 py-3 bg-background border border-border rounded-md outline-none focus:border-accent-primary transition-colors text-sm font-medium"
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="label">Category</label>
                <select className="w-full px-4 py-3 bg-background border border-border rounded-md outline-none focus:border-accent-primary transition-colors text-sm font-medium appearance-none">
                  <option>API Key</option>
                  <option>OAuth Token</option>
                  <option>Database Credentials</option>
                  <option>SSH Key</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="label">Environment</label>
                <select className="w-full px-4 py-3 bg-background border border-border rounded-md outline-none focus:border-accent-primary transition-colors text-sm font-medium appearance-none">
                  <option>Production</option>
                  <option>Staging</option>
                  <option>Development</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="label">Secret Value</label>
              <div className="relative flex items-center group">
                <input 
                  type={showSecret ? "text" : "password"} 
                  placeholder="Enter secret value..." 
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
                <span className="text-sm font-bold text-accent-primary">Encryption Guard Active</span>
                <p className="text-xs text-accent-dark/80 leading-relaxed">
                  This secret will be vaulted and only issued to agents via scoped tokens. It will never be exposed in plain text.
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
              <button 
                type="submit" 
                className="btn-primary px-8 shadow-lg shadow-accent-primary/20"
              >
                Vault Secret
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
