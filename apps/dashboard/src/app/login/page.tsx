'use client';

import Link from 'next/link';
import { ShieldCheck, Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center p-6 fade-in">
      <div className="glass w-full max-w-[440px] p-12 flex flex-col gap-8 shadow-2xl">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 bg-accent-light rounded-2xl flex items-center justify-center mb-2">
            <ShieldCheck className="text-accent-primary" size={40} />
          </div>
          <h1 className="text-4xl font-display font-bold">Welcome back</h1>
          <p className="text-text-secondary text-lg">Sign in to your AgentKey dashboard</p>
        </div>

        <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-col gap-2">
            <label className="label">Work Email</label>
            <div className="relative flex items-center group">
              <Mail
                size={18}
                className="absolute left-4 text-text-tertiary group-focus-within:text-accent-primary transition-colors"
              />
              <input
                type="email"
                placeholder="name@company.com"
                className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-md outline-none focus:border-accent-primary transition-all text-sm font-medium"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="label">Password</label>
              <a href="#" className="text-xs font-bold text-accent-primary hover:underline">
                Forgot?
              </a>
            </div>
            <div className="relative flex items-center group">
              <Lock
                size={18}
                className="absolute left-4 text-text-tertiary group-focus-within:text-accent-primary transition-colors"
              />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-md outline-none focus:border-accent-primary transition-all text-sm font-medium"
                required
              />
            </div>
          </div>

          <button className="btn-primary w-full py-4 text-base flex justify-center items-center gap-3 shadow-lg shadow-accent-primary/20 group">
            <span>Sign in</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="flex items-center justify-center gap-2 text-sm">
          <p className="text-text-secondary">Don&apos;t have an account?</p>
          <Link href="/signup" className="font-bold text-accent-primary hover:underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
