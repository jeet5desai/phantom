'use client';

import { useState } from 'react';
import {
  User,
  Lock,
  Users,
  CreditCard,
  Bell,
  Shield,
  Mail,
  Smartphone,
  ChevronRight,
  LogOut,
  Plus,
} from 'lucide-react';

const TABS = [
  { id: 'general', name: 'General', icon: User },
  { id: 'security', name: 'Security', icon: Shield },
  { id: 'members', name: 'Team Members', icon: Users },
  { id: 'billing', name: 'Billing', icon: CreditCard },
  { id: 'notifications', name: 'Notifications', icon: Bell },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="flex flex-col gap-lg fade-in">
      <div className="flex flex-col gap-1 mb-2">
        <h1 className="text-4xl font-display font-bold">Settings</h1>
        <p className="text-text-secondary text-lg">
          Manage your organization preferences, security, and team members.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-lg">
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-64 flex flex-col gap-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                  isActive
                    ? 'bg-accent-primary text-white font-bold shadow-md shadow-accent-primary/20'
                    : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                }`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{tab.name}</span>
              </button>
            );
          })}
          <div className="mt-8 pt-4 border-t border-border">
            <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-error hover:bg-error-bg transition-all w-full text-left font-bold text-sm">
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 glass p-lg lg:p-12 flex flex-col gap-10">
          {activeTab === 'general' && (
            <div className="flex flex-col gap-8 max-w-2xl animate-in slide-in-from-right-4 duration-300">
              <div className="flex flex-col gap-2 border-b border-border pb-6">
                <h3 className="text-2xl font-display font-bold">Profile Information</h3>
                <p className="text-sm text-text-secondary">
                  Update your personal details and how others see you on the platform.
                </p>
              </div>

              <div className="flex items-center gap-8">
                <div className="w-24 h-24 bg-accent-light rounded-full flex items-center justify-center border-4 border-surface shadow-sm overflow-hidden relative group cursor-pointer">
                  <span className="text-3xl font-display font-bold text-accent-primary">JD</span>
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Smartphone size={24} className="text-white" />
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <button className="btn-primary py-2 text-sm">Change Avatar</button>
                  <button className="btn-outline py-2 text-sm border-error text-error hover:bg-error-bg">
                    Remove
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="label">Full Name</label>
                  <input type="text" defaultValue="John Doe" className="input-field" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="label">Email Address</label>
                  <input type="email" defaultValue="john@phantom.ai" className="input-field" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="label">Organization</label>
                  <input type="text" defaultValue="Phantom AI" className="input-field" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="label">Timezone</label>
                  <select className="input-field">
                    <option>Pacific Time (PT)</option>
                    <option>Eastern Time (ET)</option>
                    <option>GMT / UTC</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-border mt-4">
                <button className="px-6 py-3 font-bold text-text-secondary hover:bg-surface-hover rounded-md transition-colors">
                  Discard
                </button>
                <button className="btn-primary px-8 shadow-lg shadow-accent-primary/20">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="flex flex-col gap-8 max-w-2xl animate-in slide-in-from-right-4 duration-300">
              <div className="flex flex-col gap-2 border-b border-border pb-6">
                <h3 className="text-2xl font-display font-bold">Security Settings</h3>
                <p className="text-sm text-text-secondary">
                  Manage your password and account security preferences.
                </p>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between p-6 bg-background rounded-xl border border-border group hover:border-accent-primary transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center shadow-sm">
                      <Lock size={20} className="text-accent-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold">Password</span>
                      <span className="text-xs text-text-secondary">Last changed 4 months ago</span>
                    </div>
                  </div>
                  <ChevronRight
                    size={20}
                    className="text-text-tertiary group-hover:text-accent-primary group-hover:translate-x-1 transition-all"
                  />
                </div>

                <div className="flex items-center justify-between p-6 bg-background rounded-xl border border-border group hover:border-accent-primary transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center shadow-sm">
                      <Smartphone size={20} className="text-accent-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold">Two-Factor Authentication</span>
                      <span className="text-xs text-success font-bold uppercase tracking-tighter">
                        Enabled • Authenticator App
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    size={20}
                    className="text-text-tertiary group-hover:text-accent-primary group-hover:translate-x-1 transition-all"
                  />
                </div>

                <div className="flex items-center justify-between p-6 bg-background rounded-xl border border-border group hover:border-accent-primary transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center shadow-sm">
                      <Mail size={20} className="text-accent-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold">Session Management</span>
                      <span className="text-xs text-text-secondary">
                        3 active sessions in 2 locations
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    size={20}
                    className="text-text-tertiary group-hover:text-accent-primary group-hover:translate-x-1 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="flex flex-col gap-8 animate-in slide-in-from-right-4 duration-300">
              <div className="flex flex-col gap-2 border-b border-border pb-6">
                <h3 className="text-2xl font-display font-bold">Billing & Subscription</h3>
                <p className="text-sm text-text-secondary">
                  Manage your plan, payment methods and billing history.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                <div className="bg-accent-primary p-8 rounded-2xl text-white flex flex-col gap-6 shadow-xl shadow-accent-primary/20 relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold uppercase tracking-widest text-white/60">
                      Current Plan
                    </span>
                    <h4 className="text-3xl font-display font-bold">Enterprise Pro</h4>
                  </div>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-display font-bold">$499</span>
                    <span className="text-sm font-medium text-white/80 pb-2">/ month</span>
                  </div>
                  <button className="bg-white text-accent-primary py-3 rounded-md font-bold text-sm hover:bg-accent-light transition-colors">
                    Upgrade Plan
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  <label className="label">Payment Method</label>
                  <div className="p-6 border border-border rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-8 bg-surface border border-border rounded-sm flex items-center justify-center font-bold text-xs">
                        VISA
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">•••• •••• •••• 4242</span>
                        <span className="text-[10px] text-text-tertiary">Expires 12/26</span>
                      </div>
                    </div>
                    <button className="text-xs font-bold text-accent-primary hover:underline">
                      Edit
                    </button>
                  </div>
                  <button className="text-sm font-bold text-text-secondary flex items-center gap-2 hover:text-text-primary transition-colors">
                    <Plus size={16} />
                    Add new method
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <style jsx>{`
        .input-field {
          @apply w-full px-4 py-3 bg-background border border-border rounded-md outline-none focus:border-accent-primary transition-colors text-sm font-medium;
        }
      `}</style>
    </div>
  );
}
