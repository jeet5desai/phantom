"use client";

import Link from "next/link";
import { ShieldCheck, Mail, Lock, User, ArrowRight } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center p-6 fade-in">
      <div className="glass w-full max-w-[440px] p-12 flex flex-col gap-8 shadow-2xl">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-16 h-16 bg-accent-light rounded-2xl flex items-center justify-center mb-2">
            <ShieldCheck className="text-accent-primary" size={40} />
          </div>
          <h1 className="text-4xl font-display font-bold">Create account</h1>
          <p className="text-text-secondary text-lg">Start securing your AI agents today</p>
        </div>

        <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-col gap-2">
            <label className="label">Full Name</label>
            <div className="relative flex items-center group">
              <User size={18} className="absolute left-4 text-text-tertiary group-focus-within:text-accent-primary transition-colors" />
              <input 
                type="text" 
                placeholder="John Doe" 
                className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-md outline-none focus:border-accent-primary transition-all text-sm font-medium"
                required 
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="label">Work Email</label>
            <div className="relative flex items-center group">
              <Mail size={18} className="absolute left-4 text-text-tertiary group-focus-within:text-accent-primary transition-colors" />
              <input 
                type="email" 
                placeholder="name@company.com" 
                className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-md outline-none focus:border-accent-primary transition-all text-sm font-medium"
                required 
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="label">Password</label>
            <div className="relative flex items-center group">
              <Lock size={18} className="absolute left-4 text-text-tertiary group-focus-within:text-accent-primary transition-colors" />
              <input 
                type="password" 
                placeholder="Min. 8 characters" 
                className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-md outline-none focus:border-accent-primary transition-all text-sm font-medium"
                required 
              />
            </div>
          </div>

          <button className="btn-primary w-full py-4 text-base flex justify-center items-center gap-3 shadow-lg shadow-accent-primary/20 group mt-2">
            <span>Get started</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="flex items-center justify-center gap-2 text-sm">
          <p className="text-text-secondary">Already have an account?</p>
          <Link href="/login" className="font-bold text-accent-primary hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
