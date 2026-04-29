import { Link } from 'react-router-dom';
import {
  Code,
  Shield,
  MessageSquare,
  Search,
  ExternalLink,
  PlayCircle,
  FileText,
  ChevronRight,
  Cpu,
  Layers,
  Lock,
  Globe,
} from 'lucide-react';

const CATEGORIES = [
  {
    title: 'Foundations',
    description: 'Learn the core concepts of AI Identity and Governance.',
    icon: Shield,
    items: [
      { name: 'Identity Management', slug: 'identity-management' },
      { name: 'Policy Engine 101', slug: 'policy-engine' },
      { name: 'Managing Phantom Keys', slug: 'identity-keys' },
    ],
    color: 'text-accent-primary',
    bgColor: 'bg-accent-light',
  },
  {
    title: 'Security & Privacy',
    description: 'Advanced features to protect your data and models.',
    icon: Lock,
    items: [
      { name: 'Data Scrubber setup', slug: 'data-scrubber' },
      { name: 'Human-in-the-loop', slug: 'hitl' },
      { name: 'Anomaly Detection', slug: 'anomaly-detection' },
    ],
    color: 'text-success',
    bgColor: 'bg-success-bg',
  },
  {
    title: 'Deployment',
    description: 'Guidelines for production scale and CI/CD.',
    icon: Globe,
    items: [
      { name: 'Self-hosting Phantom', slug: 'self-hosting' },
      { name: 'High Availability', slug: 'ha' },
      { name: 'Vault Configuration', slug: 'vault-config' },
    ],
    color: 'text-warning',
    bgColor: 'bg-warning-bg',
  },
  {
    title: 'API & SDKs',
    description: 'Developer references for all major languages.',
    icon: Code,
    items: [
      { name: 'Python SDK', slug: 'python-sdk' },
      { name: 'Node.js SDK', slug: 'node-sdk' },
      { name: 'REST API Specs', slug: 'api-specs' },
    ],
    color: 'text-[#635bff]',
    bgColor: 'bg-[#635bff]/10',
  },
];

const INTEGRATIONS = [
  {
    name: 'OpenClaw',
    description: 'Secure autonomous agent execution for OpenClaw frameworks.',
    icon: Cpu,
    status: 'Official',
    featured: true,
    slug: 'openclaw-integration',
  },
  {
    name: 'LangChain',
    description: 'Governance middleware for LangChain LCEL chains.',
    icon: Layers,
    status: 'Stable',
    slug: 'langchain',
  },
  {
    name: 'CrewAI',
    description: 'Identity management for multi-agent systems.',
    icon: MessageSquare,
    status: 'Beta',
    slug: 'crewai',
  },
];

export default function Resources() {
  return (
    <div className="flex flex-col gap-lg fade-in">
      {/* Hero Section - Matching Dashboard Theme */}
      <div className="bg-accent-primary rounded-[2rem] p-lg lg:p-20 text-white flex flex-col items-center text-center gap-8 relative overflow-hidden shadow-2xl shadow-accent-primary/20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent)]"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

        <div className="flex flex-col gap-4 relative z-10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="px-3 py-1 bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest rounded-full border border-white/30 backdrop-blur-md">
              Developer Portal
            </span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-display font-bold tracking-tight">
            Knowledge & <span className="text-white/80 italic">Integrations</span>
          </h1>
          <p className="text-white/90 text-lg max-w-2xl mx-auto font-medium">
            Everything you need to build, secure, and monitor autonomous AI agents with Phantom.
          </p>
        </div>

        <div className="w-full max-w-2xl relative z-10 mt-4">
          <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/50" />
          <input
            type="text"
            placeholder="Search integrations, SDKs, and security guides..."
            className="w-full pl-16 pr-8 py-5 bg-white border-none rounded-2xl text-text-primary outline-none focus:ring-8 focus:ring-white/20 transition-all text-lg placeholder:text-text-tertiary shadow-xl"
          />
        </div>
      </div>

      {/* Framework Ecosystem */}
      <div className="flex flex-col gap-6 mt-4">
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-display font-bold text-text-primary">
              Framework Ecosystem
            </h2>
            <p className="text-sm text-text-secondary">
              Official adapters for your favorite AI frameworks.
            </p>
          </div>
          <button className="text-xs font-bold text-accent-primary hover:text-accent-dark transition-colors flex items-center gap-1">
            Explore All <ExternalLink size={12} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          {INTEGRATIONS.map((int) => (
            <Link
              to={`/resources/${int.slug}`}
              key={int.name}
              className={`glass p-lg flex flex-col gap-5 hover:border-accent-primary/50 transition-all duration-300 cursor-pointer group relative overflow-hidden hover:shadow-xl hover:shadow-accent-primary/5 ${int.featured ? 'border-accent-primary/30 bg-accent-light/30' : ''}`}
            >
              {int.featured && (
                <div className="absolute -right-12 top-6 bg-accent-primary text-white px-12 py-1 text-[10px] font-bold uppercase tracking-widest rotate-45 shadow-xl">
                  Featured
                </div>
              )}

              <div className="flex justify-between items-start">
                <div className="w-14 h-14 bg-accent-light rounded-2xl flex items-center justify-center text-accent-primary group-hover:scale-110 transition-transform">
                  <int.icon size={28} />
                </div>
                <span
                  className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-tighter ${int.status === 'Official' ? 'bg-success/10 text-success border border-success/20' : 'bg-surface-hover text-text-tertiary border border-border'}`}
                >
                  {int.status}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-xl font-display font-bold text-text-primary">{int.name}</h3>
                <p className="text-xs text-text-secondary leading-relaxed">{int.description}</p>
              </div>

              <div className="mt-2 pt-4 border-t border-border flex items-center gap-2 text-xs font-bold text-accent-primary group-hover:gap-3 transition-all">
                Integration Guide <ChevronRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Documentation Tracks */}
      <div className="flex flex-col gap-6 mt-8">
        <h2 className="text-2xl font-display font-bold text-text-primary">Documentation Tracks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.title}
              className="glass p-lg flex flex-col gap-6 group hover:bg-white transition-all duration-300 hover:shadow-xl hover:shadow-accent-primary/5"
            >
              <div
                className={`w-12 h-12 ${cat.bgColor} ${cat.color} rounded-xl flex items-center justify-center`}
              >
                <cat.icon size={24} />
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="font-display font-bold text-lg text-text-primary">{cat.title}</h3>
                  <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  {cat.items.map((item) => (
                    <Link
                      to={`/resources/${item.slug}`}
                      key={item.slug}
                      className="flex items-center gap-2 text-xs text-text-secondary hover:text-accent-primary cursor-pointer transition-colors group/item"
                    >
                      <ChevronRight
                        size={12}
                        className="text-text-tertiary group-hover/item:translate-x-1 transition-transform"
                      />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workshop & Support */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg mt-8">
        <div className="lg:col-span-2 glass flex flex-col overflow-hidden bg-white shadow-sm">
          <div className="px-lg py-5 border-b border-border flex items-center justify-between bg-surface-hover/30">
            <div className="flex items-center gap-3">
              <PlayCircle size={20} className="text-accent-primary" />
              <h3 className="text-xl font-display font-bold text-text-primary">Workshop Series</h3>
            </div>
            <button className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest hover:text-accent-primary transition-colors">
              View YouTube Channel
            </button>
          </div>
          <div className="p-lg grid grid-cols-1 md:grid-cols-2 gap-lg">
            <Link
              to="/resources/openclaw-integration"
              className="flex flex-col gap-4 group cursor-pointer"
            >
              <div className="aspect-video bg-accent-light border border-accent-primary/10 rounded-2xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-accent-primary/5 group-hover:bg-accent-primary/0 transition-colors"></div>
                <PlayCircle
                  size={48}
                  className="text-accent-primary relative z-10 group-hover:scale-110 transition-transform opacity-80"
                />
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <span className="px-2 py-1 bg-white/90 backdrop-blur-md rounded text-[10px] font-bold text-accent-primary uppercase tracking-tighter border border-accent-primary/20">
                    Setup Guide
                  </span>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-sm text-text-primary group-hover:text-accent-primary transition-colors">
                  Zero-Trust Identities in OpenClaw
                </h4>
                <p className="text-[11px] text-text-secondary mt-1">
                  Mastering the Phantom Key lifecycle.
                </p>
              </div>
            </Link>
            <Link to="/resources/policy-engine" className="flex flex-col gap-4 group cursor-pointer">
              <div className="aspect-video bg-accent-light border border-accent-primary/10 rounded-2xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-accent-primary/5 group-hover:bg-accent-primary/0 transition-colors"></div>
                <PlayCircle
                  size={48}
                  className="text-accent-primary relative z-10 group-hover:scale-110 transition-transform opacity-80"
                />
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <span className="px-2 py-1 bg-white/90 backdrop-blur-md rounded text-[10px] font-bold text-accent-primary uppercase tracking-tighter border border-accent-primary/20">
                    Policy Engine
                  </span>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-sm text-text-primary group-hover:text-accent-primary transition-colors">
                  Writing Custom Security Policies
                </h4>
                <p className="text-[11px] text-text-secondary mt-1">
                  Granular control for autonomous flows.
                </p>
              </div>
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-lg">
          <div className="glass p-lg bg-accent-light border-accent-primary/20 flex flex-col gap-6 relative overflow-hidden shadow-lg shadow-accent-primary/5">
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-accent-primary/10 rounded-full blur-2xl"></div>
            <div className="flex flex-col gap-2 relative z-10">
              <h3 className="text-lg font-display font-bold text-text-primary">
                Integration Support
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Having trouble connecting your specific agent framework? Our engineers are here to
                help.
              </p>
            </div>
            <div className="flex flex-col gap-3 relative z-10">
              <button className="btn-primary w-full text-xs py-3 shadow-lg shadow-accent-primary/30">
                Book Integration Audit
              </button>
              <button className="btn-outline w-full text-xs py-3 bg-white">
                Join Developer Discord
              </button>
            </div>
          </div>

          <div className="glass p-lg flex flex-col gap-5">
            <h4 className="text-xs font-bold uppercase tracking-widest text-text-tertiary font-mono">
              Latest Specs
            </h4>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-surface-hover rounded flex items-center justify-center">
                    <FileText size={16} className="text-text-secondary" />
                  </div>
                  <span className="text-[11px] font-bold text-text-secondary group-hover:text-accent-primary">
                    OpenAPI Specification v2.4
                  </span>
                </div>
                <ExternalLink
                  size={12}
                  className="text-text-tertiary group-hover:text-accent-primary transition-colors"
                />
              </div>
              <div className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-surface-hover rounded flex items-center justify-center">
                    <Layers size={16} className="text-text-secondary" />
                  </div>
                  <span className="text-[11px] font-bold text-text-secondary group-hover:text-accent-primary">
                    Audit Log Schema Reference
                  </span>
                </div>
                <ExternalLink
                  size={12}
                  className="text-text-tertiary group-hover:text-accent-primary transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
