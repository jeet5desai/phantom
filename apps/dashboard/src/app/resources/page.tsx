"use client";

import { 
  BookOpen, 
  Code, 
  Terminal, 
  Zap, 
  Shield, 
  MessageSquare,
  Search,
  ExternalLink,
  PlayCircle,
  FileText,
  ChevronRight
} from "lucide-react";

const RESOURCES = [
  {
    title: "Quickstart Guide",
    description: "Learn how to deploy your first agent and configure identity in less than 5 minutes.",
    icon: Zap,
    color: "text-accent-primary",
    bgColor: "bg-accent-light"
  },
  {
    title: "API Documentation",
    description: "Complete reference for our REST API and SDKs for Python, Node.js and Go.",
    icon: Code,
    color: "text-[#635bff]",
    bgColor: "bg-[#635bff]/10"
  },
  {
    title: "Security Best Practices",
    description: "Essential guidelines for managing secrets and defining fine-grained permissions.",
    icon: Shield,
    color: "text-success",
    bgColor: "bg-success-bg"
  },
  {
    title: "CLI Tooling",
    description: "Download and configure the AgentKey CLI for local development and CI/CD.",
    icon: Terminal,
    color: "text-text-primary",
    bgColor: "bg-surface-hover"
  }
];

const POPULAR_DOCS = [
  "Integrating with LangChain",
  "Rotating API keys automatically",
  "Setting up SSO with Okta",
  "Configuring Audit Log webhooks",
  "Customizing agent identities",
  "Handling rate limits"
];

export default function ResourcesPage() {
  return (
    <div className="flex flex-col gap-lg fade-in">
      {/* Hero Section */}
      <div className="bg-accent-primary rounded-2xl p-lg lg:p-16 text-white flex flex-col items-center text-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent)]"></div>
        <div className="flex flex-col gap-4 relative z-10">
          <h1 className="text-4xl lg:text-5xl font-display font-bold">How can we help you?</h1>
          <p className="text-white/80 text-lg max-w-3xl">Search our documentation, tutorials, and developer resources to build secure AI agents.</p>
        </div>
        
        <div className="w-full max-w-2xl relative z-10">
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input 
            type="text" 
            placeholder="Search docs, APIs, and guides..." 
            className="w-full pl-16 pr-8 py-5 bg-white rounded-xl text-text-primary outline-none focus:ring-4 focus:ring-white/20 transition-all text-lg placeholder:text-text-tertiary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg -mt-12 relative z-20 px-4">
        {RESOURCES.map((res) => {
          const Icon = res.icon;
          return (
            <div key={res.title} className="glass p-lg flex flex-col gap-4 hover:-translate-y-2 transition-all duration-300 cursor-pointer group ">
              <div className={`w-12 h-12 ${res.bgColor} ${res.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-display font-bold text-lg">{res.title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed">{res.description}</p>
              </div>
              <div className="mt-auto pt-4 flex items-center gap-1 text-[10px] font-bold text-accent-primary uppercase tracking-widest group-hover:gap-2 transition-all">
                Learn More <ChevronRight size={12} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg mt-8">
        <div className="lg:col-span-2 flex flex-col gap-lg">
          <div className="glass flex flex-col">
            <div className="px-lg py-5 border-b border-border flex items-center justify-between bg-surface">
              <div className="flex items-center gap-3">
                <PlayCircle size={20} className="text-text-secondary" />
                <h3 className="text-xl font-display font-bold">Video Tutorials</h3>
              </div>
              <button className="text-xs font-bold text-accent-primary hover:underline">View all</button>
            </div>
            <div className="p-lg grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="flex flex-col gap-3 group cursor-pointer">
                <div className="aspect-video bg-background border border-border rounded-xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                  <PlayCircle size={48} className="text-white relative z-10 group-hover:scale-110 transition-transform" />
                  <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 rounded text-[10px] font-bold text-white">4:20</div>
                </div>
                <span className="font-bold text-sm group-hover:text-accent-primary transition-colors">Understanding Agent Sandboxing</span>
              </div>
              <div className="flex flex-col gap-3 group cursor-pointer">
                <div className="aspect-video bg-background border border-border rounded-xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                  <PlayCircle size={48} className="text-white relative z-10 group-hover:scale-110 transition-transform" />
                  <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 rounded text-[10px] font-bold text-white">6:15</div>
                </div>
                <span className="font-bold text-sm group-hover:text-accent-primary transition-colors">Implementing Custom Guardrails</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-lg">
          <div className="glass p-lg flex flex-col gap-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <FileText size={20} className="text-text-secondary" />
              <h3 className="text-lg font-display font-bold">Popular Topics</h3>
            </div>
            <div className="flex flex-col gap-2">
              {POPULAR_DOCS.map((doc) => (
                <div key={doc} className="flex items-center justify-between p-3 hover:bg-background rounded-lg transition-colors cursor-pointer group">
                  <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary">{doc}</span>
                  <ExternalLink size={14} className="text-text-tertiary opacity-0 group-hover:opacity-100" />
                </div>
              ))}
            </div>
          </div>

          <div className="glass p-lg bg-surface-hover flex flex-col gap-4 items-center text-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center ">
              <MessageSquare size={24} className="text-accent-primary" />
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="font-display font-bold">Need direct help?</h4>
              <p className="text-xs text-text-secondary">Our support team is available 24/7 for Enterprise customers.</p>
            </div>
            <button className="btn-primary w-full text-sm">Open Support Ticket</button>
          </div>
        </div>
      </div>
    </div>
  );
}
