import { useParams, Link, Navigate } from 'react-router-dom';
import {
  ChevronLeft,
  BookOpen,
  Shield,
  Cpu,
  CheckCircle2,
  Info,
  AlertTriangle,
} from 'lucide-react';

interface DocSection {
  title: string;
  slug: string;
  content: React.ReactNode;
}

const DOCS_CONTENT: Record<string, DocSection> = {
  'openclaw-integration': {
    title: 'OpenClaw Integration Guide',
    slug: 'openclaw-integration',
    content: (
      <div className="flex flex-col gap-6">
        <p className="text-lg text-text-secondary leading-relaxed">
          OpenClaw is the premier framework for building autonomous agents. Phantom provides a
          zero-trust identity layer that ensures every action taken by an OpenClaw agent is
          authenticated and audited.
        </p>

        <div className="p-4 bg-accent-light border border-accent-primary/20 rounded-xl flex gap-4 items-start">
          <Info className="text-accent-primary shrink-0 mt-1" size={20} />
          <p className="text-sm text-accent-dark font-medium">
            This guide assumes you have an existing OpenClaw project and a Phantom AgentKey.
          </p>
        </div>

        <h2 className="text-2xl font-bold mt-4">1. Install the SDK</h2>
        <div className="bg-[#1e1e2e] p-4 rounded-xl font-mono text-sm text-white overflow-x-auto border border-white/5 shadow-lg">
          <code className="text-accent-primary">npm install</code> @agentkey/sdk-openclaw
        </div>

        <h2 className="text-2xl font-bold mt-4">2. Initialize the Identity Proxy</h2>
        <p className="text-text-secondary">
          Wrap your OpenClaw agent initialization with the Phantom Proxy to begin governing its
          lifecycle.
        </p>
        <div className="bg-[#1e1e2e] p-4 rounded-xl font-mono text-sm text-white overflow-x-auto border border-white/5 shadow-lg">
          <span className="text-purple-400">import</span> {'{ PhantomProxy }'}{' '}
          <span className="text-purple-400">from</span>{' '}
          <span className="text-green-400">'@agentkey/sdk-openclaw'</span>;{'\n\n'}
          <span className="text-gray-400">// Initialize with your AgentKey</span>
          {'\n'}
          <span className="text-purple-400">const</span> agent ={' '}
          <span className="text-purple-400">new</span> PhantomProxy({'{'}
          {'\n'}
          {'  '}agentKey: process.env.PHANTOM_AGENT_KEY,{'\n'}
          {'  '}framework: <span className="text-green-400">'openclaw'</span>
          {'\n'}
          {'}'});
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="glass p-6 border-success/20">
            <CheckCircle2 className="text-success mb-3" size={24} />
            <h4 className="font-bold mb-2">Automated Auditing</h4>
            <p className="text-xs text-text-tertiary">
              All tool calls are automatically captured and sent to the Phantom audit stream.
            </p>
          </div>
          <div className="glass p-6 border-accent-primary/20">
            <Shield className="text-accent-primary mb-3" size={24} />
            <h4 className="font-bold mb-2">Dynamic Revocation</h4>
            <p className="text-xs text-text-tertiary">
              If the agent is revoked in the dashboard, all active OpenClaw sessions terminate
              instantly.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  'identity-management': {
    title: 'Identity Management 101',
    slug: 'identity-management',
    content: (
      <div className="flex flex-col gap-6">
        <p className="text-lg text-text-secondary leading-relaxed">
          Identity is the core of Phantom. Unlike traditional API keys, an AgentKey represents a
          living digital identity for your autonomous software.
        </p>

        <h2 className="text-2xl font-bold mt-4">The Identity Lifecycle</h2>
        <div className="relative pl-8 border-l-2 border-border flex flex-col gap-8 my-4">
          <div className="relative">
            <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-accent-primary border-4 border-background"></div>
            <h4 className="font-bold text-text-primary">Provisioning</h4>
            <p className="text-xs text-text-secondary">
              Creating a unique cryptographic identity in the Phantom Vault.
            </p>
          </div>
          <div className="relative">
            <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-border border-4 border-background"></div>
            <h4 className="font-bold text-text-primary">Attestation</h4>
            <p className="text-xs text-text-secondary">
              The agent proves its identity during the initial handshake with the gateway.
            </p>
          </div>
          <div className="relative">
            <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-border border-4 border-background"></div>
            <h4 className="font-bold text-text-primary">Governance</h4>
            <p className="text-xs text-text-secondary">
              The agent operates within its defined policy boundaries.
            </p>
          </div>
        </div>

        <div className="p-4 bg-error/5 border border-error/20 rounded-xl flex gap-4 items-start">
          <AlertTriangle className="text-error shrink-0 mt-1" size={20} />
          <p className="text-sm text-error font-medium">
            Never share AgentKeys in client-side code. They should only be used in secure,
            server-side environments.
          </p>
        </div>
      </div>
    ),
  },
  'policy-engine': {
    title: 'Policy Engine 101',
    slug: 'policy-engine',
    content: (
      <div className="flex flex-col gap-6">
        <p className="text-lg text-text-secondary leading-relaxed">
          The Policy Engine allows you to define fine-grained rules for what your agents can and
          cannot do.
        </p>
        <h2 className="text-2xl font-bold mt-4">Writing Your First Policy</h2>
        <div className="bg-[#1e1e2e] p-4 rounded-xl font-mono text-sm text-white">
          {'{'}
          {'\n'}
          {'  '}"resource": "filesystem",{'\n'}
          {'  '}"action": "write",{'\n'}
          {'  '}"effect": "deny",{'\n'}
          {'  '}"conditions": {'{'} "path": "/etc/*" {'}'}
          {'\n'}
          {'}'}
        </div>
      </div>
    ),
  },
  agentkeys: {
    title: 'Managing AgentKeys',
    slug: 'agentkeys',
    content: (
      <div className="flex flex-col gap-6">
        <p className="text-lg text-text-secondary">
          Learn how to rotate, revoke, and monitor your agent identities.
        </p>
      </div>
    ),
  },
  'data-scrubber': {
    title: 'Data Scrubber Setup',
    slug: 'data-scrubber',
    content: (
      <div className="flex flex-col gap-6">
        <p className="text-lg text-text-secondary">
          Automatically mask PII and sensitive data before it reaches your models.
        </p>
      </div>
    ),
  },
  hitl: {
    title: 'Human-in-the-loop',
    slug: 'hitl',
    content: (
      <div className="flex flex-col gap-6">
        <p className="text-lg text-text-secondary">
          Set up approval workflows for high-risk agent actions.
        </p>
      </div>
    ),
  },
  'anomaly-detection': {
    title: 'Anomaly Detection',
    slug: 'anomaly-detection',
    content: (
      <div className="flex flex-col gap-6">
        <p className="text-lg text-text-secondary">
          Detect unusual agent behavior using Phantom's behavioral analysis engine.
        </p>
      </div>
    ),
  },
  'self-hosting': {
    title: 'Self-hosting Phantom',
    slug: 'self-hosting',
    content: (
      <div className="flex flex-col gap-6">
        <p className="text-lg text-text-secondary">
          Deploy Phantom on your own infrastructure using Docker or Kubernetes.
        </p>
      </div>
    ),
  },
  ha: {
    title: 'High Availability',
    slug: 'ha',
    content: (
      <div className="flex flex-col gap-6">
        <p className="text-lg text-text-secondary">
          Configure Phantom for mission-critical uptime across multiple regions.
        </p>
      </div>
    ),
  },
  'vault-config': {
    title: 'Vault Configuration',
    slug: 'vault-config',
    content: (
      <div className="flex flex-col gap-6">
        <p className="text-lg text-text-secondary">
          Securely manage your master keys and cryptographic secrets.
        </p>
      </div>
    ),
  },
  'python-sdk': {
    title: 'Python SDK',
    slug: 'python-sdk',
    content: (
      <div className="flex flex-col gap-6">
        <p className="text-lg text-text-secondary">
          Integrate Phantom into your Python-based AI agents with ease.
        </p>
      </div>
    ),
  },
  'node-sdk': {
    title: 'Node.js SDK',
    slug: 'node-sdk',
    content: (
      <div className="flex flex-col gap-6">
        <p className="text-lg text-text-secondary">
          Governance for JavaScript and TypeScript agents.
        </p>
      </div>
    ),
  },
  'api-specs': {
    title: 'REST API Specs',
    slug: 'api-specs',
    content: (
      <div className="flex flex-col gap-6">
        <p className="text-lg text-text-secondary">
          Direct API access for custom integrations and CLI tools.
        </p>
      </div>
    ),
  },
  langchain: {
    title: 'LangChain Setup',
    slug: 'langchain',
    content: (
      <div className="flex flex-col gap-6">
        <p className="text-lg text-text-secondary leading-relaxed">
          Phantom integrates directly with LangChain via custom callbacks and tracers.
        </p>
        <div className="bg-[#1e1e2e] p-4 rounded-xl font-mono text-sm text-white">
          from phantom.langchain import PhantomCallbackHandler{'\n\n'}
          handler = PhantomCallbackHandler(agent_key="..."){'\n'}
          chain.run(input, callbacks=[handler])
        </div>
      </div>
    ),
  },
  crewai: {
    title: 'CrewAI Identity',
    slug: 'crewai',
    content: (
      <div className="flex flex-col gap-6">
        <p className="text-lg text-text-secondary">
          Manage identities for complex multi-agent crews.
        </p>
      </div>
    ),
  },
};

const DOC_GROUPS = [
  {
    title: 'Foundations',
    icon: Shield,
    items: [
      { name: 'Identity Management', slug: 'identity-management' },
      { name: 'Policy Engine 101', slug: 'policy-engine' },
      { name: 'Managing AgentKeys', slug: 'agentkeys' },
    ],
  },
  {
    title: 'Integrations',
    icon: Cpu,
    items: [
      { name: 'OpenClaw Guide', slug: 'openclaw-integration' },
      { name: 'LangChain Setup', slug: 'langchain' },
      { name: 'CrewAI Identity', slug: 'crewai' },
    ],
  },
];

export default function DocViewer() {
  const { slug } = useParams<{ slug: string }>();
  const doc = slug ? DOCS_CONTENT[slug] : null;

  if (!doc && slug) {
    return <Navigate to="/resources" replace />;
  }

  return (
    <div className="flex gap-lg fade-in h-full min-h-[calc(100vh-120px)]">
      {/* Side Nav */}
      <div className="hidden lg:flex flex-col w-64 shrink-0 gap-8">
        <Link
          to="/resources"
          className="flex items-center gap-2 text-sm font-bold text-accent-primary hover:gap-3 transition-all"
        >
          <ChevronLeft size={16} /> Back to Hub
        </Link>

        <div className="flex flex-col gap-8">
          {DOC_GROUPS.map((group) => (
            <div key={group.title} className="flex flex-col gap-4">
              <div className="flex items-center gap-2 px-2">
                <group.icon size={16} className="text-text-tertiary" />
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-text-tertiary">
                  {group.title}
                </h4>
              </div>
              <div className="flex flex-col gap-1">
                {group.items.map((item) => (
                  <Link
                    key={item.slug}
                    to={`/resources/${item.slug}`}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      slug === item.slug
                        ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/20'
                        : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 glass p-lg lg:p-16 overflow-y-auto bg-white shadow-xl shadow-accent-primary/5">
        {!doc ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-6">
            <div className="w-20 h-20 bg-accent-light rounded-3xl flex items-center justify-center text-accent-primary">
              <BookOpen size={40} />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold">Select a Guide</h1>
              <p className="text-text-tertiary mt-2">
                Pick a topic from the sidebar or head back to the Hub.
              </p>
            </div>
            <Link to="/resources" className="btn-primary">
              Return to Hub
            </Link>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 bg-accent-light text-accent-primary text-[10px] font-bold uppercase tracking-widest rounded border border-accent-primary/10">
                Documentation
              </span>
              <span className="text-text-tertiary text-xs">•</span>
              <span className="text-text-tertiary text-xs font-medium capitalize">
                {slug?.replace('-', ' ')}
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-text-primary mb-8 tracking-tight">
              {doc.title}
            </h1>
            <div className="prose prose-accent max-w-none">{doc.content}</div>

            <div className="mt-20 pt-8 border-t border-border flex justify-between items-center text-sm text-text-tertiary">
              <p>© 2026 Phantom Security, Inc.</p>
              <div className="flex gap-6">
                <button className="hover:text-accent-primary transition-colors">Helpful?</button>
                <button className="hover:text-accent-primary transition-colors">
                  Edit on GitHub
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
