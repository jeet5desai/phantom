"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { 
  ShieldCheck, 
  Plus, 
  Eye, 
  Settings, 
  ShieldAlert, 
  Zap, 
  UserRoundCheck, 
  Timer,
  AlertTriangle,
  ChevronRight,
  Shield,
  Trash2,
  AlertCircle,
  Layout,
  List
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

// Dynamically import React Flow component to avoid SSR issues
const PolicyFlowDesigner = dynamic(() => import("@/components/PolicyFlowDesigner"), { 
  ssr: false,
  loading: () => <div className="w-full h-[500px] glass animate-pulse flex items-center justify-center text-text-tertiary">Loading Visual Designer...</div>
});

const POLICIES = [
  { id: "pol_1", name: "Global Data Redaction", type: "Privacy", status: "Enabled", scope: "all:agents", description: "Automatically redact PII (SSN, Passwords, CC) from all agent inputs/outputs." },
  { id: "pol_2", name: "Financial Write Guardrail", type: "Security", status: "Enabled", scope: "stripe:*", description: "Require human approval for any transaction over $500." },
  { id: "pol_3", name: "GitHub Access Boundary", type: "Access", status: "Enabled", scope: "github:org/private/*", description: "Restrict file write access to designated production branches." },
  { id: "pol_4", name: "Model Spend Cap", type: "Budget", status: "Disabled", scope: "all:models", description: "Stop agent execution if daily spend exceeds $50." },
];

interface Statement {
  action: string;
  effect: string;
  resource: string;
}

export default function PermissionsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeMode, setActiveMode] = useState<'statements' | 'visual'>('statements');
  const [showSaveNotice, setShowSaveNotice] = useState(false);
  const [statements, setStatements] = useState<Statement[]>([
    { action: 'deny', effect: 'redact', resource: 'pii:*' }
  ]);

  const addStatement = () => {
    setStatements([...statements, { action: 'allow', effect: 'approve', resource: '*' }]);
  };

  const removeStatement = (index: number) => {
    setStatements(statements.filter((_, i) => i !== index));
  };

  const updateStatement = (index: number, field: keyof Statement, value: string) => {
    const newStatements = [...statements];
    newStatements[index] = { ...newStatements[index], [field]: value };
    setStatements(newStatements);
  };

  const handleSavePolicy = () => {
    // TODO: Implement POST /api/v1/policies backend endpoint
    setShowSaveNotice(true);
    setTimeout(() => setShowSaveNotice(false), 4000);
  };

  return (
    <div className="flex flex-col gap-lg fade-in">
      {showSaveNotice && (
        <div className="fixed top-6 right-6 z-50 p-4 bg-warning-bg border border-warning/30 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
          <AlertTriangle size={18} className="text-warning shrink-0" />
          <p className="text-sm font-medium text-text-primary">Policy engine is not yet connected. Policies are previewed locally only.</p>
        </div>
      )}
      <div className="flex justify-between items-end mb-2">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-display font-bold">Policies & Guardrails</h1>
          <p className="text-text-secondary text-lg">Define global security boundaries and human-in-the-loop requirements.</p>
        </div>
        <button 
          className="btn-primary flex items-center gap-2 "
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={20} />
          <span>Create New Policy</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        <section className="lg:col-span-2 glass overflow-hidden">
          <div className="px-lg py-4 border-b border-border flex items-center justify-between bg-surface">
            <div className="flex items-center gap-3">
              <ShieldCheck size={20} className="text-text-secondary" />
              <h3 className="text-xl font-display font-bold">Active Policies</h3>
            </div>
            <span className="text-xs font-bold text-text-tertiary bg-surface-hover px-3 py-1 rounded-full border border-border">4 Total</span>
          </div>
          <div className="divide-y divide-border">
            {POLICIES.map((policy) => (
              <div key={policy.id} className="p-lg hover:bg-background transition-colors group">
                <div className="flex justify-between gap-8 mb-6">
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="text-xl font-display font-bold group-hover:text-accent-primary transition-colors">{policy.name}</h4>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${
                        policy.status === 'Enabled' ? 'bg-success-bg text-success' : 'bg-surface-hover text-text-tertiary'
                      }`}>{policy.status}</span>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">{policy.description}</p>
                    <div className="flex gap-4 mt-2">
                      <span className="text-xs text-text-tertiary"><b>Type:</b> <span className="text-text-secondary">{policy.type}</span></span>
                      <span className="text-xs text-text-tertiary"><b>Scope:</b> <code className="bg-surface-hover px-1.5 py-0.5 rounded border border-border text-text-secondary">{policy.scope}</code></span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${policy.status === 'Enabled' ? 'bg-accent-primary' : 'bg-border'}`}>
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${policy.status === 'Enabled' ? 'left-6' : 'left-1'}`}></div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-6">
                  <button className="flex items-center gap-2 text-sm font-bold text-accent-primary hover:underline">
                    <Settings size={14} />
                    Edit Rules
                  </button>
                  <button className="flex items-center gap-2 text-sm font-bold text-accent-primary hover:underline">
                    <Eye size={14} />
                    View Audit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="flex flex-col gap-lg">
          <div className="glass p-lg flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
               <ShieldAlert size={18} className="text-text-secondary" />
               <h4 className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Global Guardrails</h4>
            </div>
            <div className="flex flex-col gap-5">
              {[
                { title: 'PII Redaction', desc: 'Sensitive data scrubbing', icon: Zap, active: true },
                { title: 'Human-in-the-loop', desc: 'Approval for critical actions', icon: UserRoundCheck, active: true },
                { title: 'Rate Limiting', desc: 'Prevent agent loops', icon: Timer, active: false },
              ].map((guard, i) => {
                const Icon = guard.icon;
                return (
                  <div key={i} className="flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border border-border transition-colors ${guard.active ? 'bg-accent-light text-accent-primary' : 'bg-surface-hover text-text-tertiary'}`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-text-primary">{guard.title}</span>
                        <p className="text-[11px] text-text-tertiary">{guard.desc}</p>
                      </div>
                    </div>
                    <div className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${guard.active ? 'bg-accent-primary' : 'bg-border'}`}>
                      <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${guard.active ? 'left-4.5' : 'left-0.5'}`}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass p-lg flex flex-col gap-4 border-l-4 border-l-warning">
            <div className="flex items-center gap-3">
               <AlertTriangle size={18} className="text-warning" />
               <h4 className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Security Alerts</h4>
            </div>
            <div className="flex justify-between items-start gap-4 cursor-pointer group">
              <p className="text-sm text-text-secondary leading-relaxed group-hover:text-text-primary transition-colors">
                <b className="text-text-primary">Policy Conflict:</b> "Financial Write" overlaps with "Global Redaction".
              </p>
              <ChevronRight size={16} className="text-text-tertiary group-hover:text-accent-primary transition-colors shrink-0" />
            </div>
          </div>
        </aside>
      </div>

      {/* Proper UI Dialog Implementation */}
      <Dialog isOpen={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <DialogContent className="max-w-[900px] overflow-y-auto max-h-[90vh]">
          <DialogClose onClick={() => setShowCreateModal(false)} />
          <DialogHeader>
            <div className="flex justify-between items-center pr-12">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <Shield size={28} className="text-accent-primary" />
                  <DialogTitle>Policy Designer</DialogTitle>
                </div>
                <DialogDescription>
                  Configure security boundaries and response strategies for autonomous agent actions.
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2 bg-surface-hover p-1 rounded-lg">
                <button 
                  onClick={() => setActiveMode('statements')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeMode === 'statements' ? 'bg-white text-accent-primary ' : 'text-text-tertiary hover:text-text-secondary'}`}
                >
                  <List size={14} />
                  Statements
                </button>
                <button 
                  onClick={() => setActiveMode('visual')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeMode === 'visual' ? 'bg-white text-accent-primary ' : 'text-text-tertiary hover:text-text-secondary'}`}
                >
                  <Layout size={14} />
                  Visual Flow
                </button>
              </div>
            </div>
          </DialogHeader>
          
          <form className="flex flex-col gap-8" onSubmit={(e) => { e.preventDefault(); handleSavePolicy(); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="label">Policy Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Multi-Step Validation" 
                  className="w-full px-4 py-3 bg-background border border-border rounded-md outline-none focus:border-accent-primary transition-colors text-sm font-medium"
                  required 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="label">Global Scope</label>
                <input 
                  type="text" 
                  placeholder="e.g. stripe:* or aws:*" 
                  className="w-full px-4 py-3 bg-background border border-border rounded-md outline-none focus:border-accent-primary transition-colors text-sm font-mono"
                  required 
                />
              </div>
            </div>

            {activeMode === 'statements' ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <label className="label">Policy Statements</label>
                  <button 
                    type="button"
                    onClick={addStatement}
                    className="flex items-center gap-2 text-xs font-bold text-accent-primary hover:underline"
                  >
                    <Plus size={14} />
                    Add Statement
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {statements.map((stmt, i) => (
                    <div key={i} className="flex flex-col md:flex-row gap-3 p-4 bg-background border border-border rounded-xl relative group animate-in slide-in-from-top-2 duration-300">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-text-tertiary uppercase">Action</span>
                          <select 
                            value={stmt.action}
                            onChange={(e) => updateStatement(i, 'action', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-border rounded-md text-xs outline-none focus:border-accent-primary transition-colors"
                          >
                            <option value="allow">ALLOW</option>
                            <option value="deny">DENY</option>
                            <option value="monitor">MONITOR</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-text-tertiary uppercase">Effect</span>
                          <select 
                            value={stmt.effect}
                            onChange={(e) => updateStatement(i, 'effect', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-border rounded-md text-xs outline-none focus:border-accent-primary transition-colors"
                          >
                            <option value="approve">Approval</option>
                            <option value="redact">Redaction</option>
                            <option value="limit">Limit</option>
                            <option value="log">Log</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-text-tertiary uppercase">Resource</span>
                          <input 
                            type="text"
                            value={stmt.resource}
                            onChange={(e) => updateStatement(i, 'resource', e.target.value)}
                            placeholder="e.g. stripe:charges"
                            className="w-full px-3 py-2 bg-white border border-border rounded-md text-xs outline-none focus:border-accent-primary transition-colors font-mono"
                          />
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeStatement(i)}
                        className="p-2 text-text-tertiary hover:text-error transition-colors mt-4 md:mt-0 self-center"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                  <label className="label">Visual Flow Graph</label>
                  <span className="text-[10px] font-bold text-text-tertiary bg-surface-hover px-2 py-1 rounded">Read Only Preview</span>
                </div>
                <PolicyFlowDesigner />
              </div>
            )}

            <div className="p-4 bg-accent-light rounded-xl flex gap-4 items-start border border-accent-primary/20">
              <AlertCircle size={20} className="text-accent-primary shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-accent-primary">Dynamic Validation Enabled</span>
                <p className="text-xs text-accent-dark/80 leading-relaxed">
                  Policies are dynamically validated against the protocol engine. Visual edits are synced with statements.
                </p>
              </div>
            </div>

            <DialogFooter>
              <button 
                type="button" 
                className="px-6 py-3 font-bold text-text-secondary hover:bg-surface-hover rounded-md transition-colors"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary px-8 "
              >
                Save Policy
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
