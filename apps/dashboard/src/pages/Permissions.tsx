import { useState, useEffect, useCallback } from 'react';
import { useRequest } from '@/hooks/useRequest';
import {
  Shield,
  Plus,
  ArrowLeft,
  Check,
  Settings,
  Activity,
  Sparkles,
  User,
  Loader2,
} from 'lucide-react';

type Permission = {
  id: string;
  name: string;
  description: string;
  agent: string;
  actions: string[];
  resources: string[];
  conditions: { key: string; value: string }[];
};

type CreationMode = 'select' | 'sentence' | 'ai' | 'visual' | null;

export default function Permissions() {
  const request = useRequest();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [creationMode, setCreationMode] = useState<CreationMode>(null);

  const [agentOptions, setAgentOptions] = useState<string[]>(['All Agents']);

  const fetchAgents = useCallback(async () => {
    try {
      const data = await request('GET', '/api/v1/agents?includeRevoked=true');
      if (data && data.agents) {
        setAgentOptions(['All Agents', ...data.agents.map((a: { name: string }) => a.name)]);
      }
    } catch (err) {
      console.error(err);
    }
  }, [request]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAgents();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchAgents]);

  // Shared Draft State
  const [draft, setDraft] = useState<Partial<Permission>>({
    name: '',
    description: '',
    agent: 'All Agents',
    actions: [],
    resources: [],
    conditions: [],
  });

  // State for AI Generator
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);

  /*
  // State for Sentence Builder (Commented out per user request)
  const [sentenceAction, setSentenceAction] = useState('read');
  const [sentenceResource, setSentenceResource] = useState('production database');
  const [sentenceCondition, setSentenceCondition] = useState('');
  */

  // Update draft.agent whenever agentOptions loads for the first time
  // (Removed unnecessary useEffect to prevent cascading renders)

  const resetDraft = () => {
    setDraft({
      name: '',
      description: '',
      agent: agentOptions[0] || 'All Agents',
      actions: [],
      resources: [],
      conditions: [],
    });
    setAiPrompt('');
    setAiGenerated(false);
    /*
    setSentenceAction('read');
    setSentenceResource('production database');
    setSentenceCondition('');
    */
  };

  const handleCreate = () => {
    const newPerm: Permission = {
      id: Math.random().toString(36).substr(2, 9),
      name: draft.name || 'Untitled Permission',
      description: draft.description || '',
      agent: draft.agent || agentOptions[0] || 'All Agents',
      actions: draft.actions?.length ? draft.actions : ['*'],
      resources: draft.resources?.length ? draft.resources : ['*'],
      conditions: draft.conditions || [],
    };

    setPermissions([...permissions, newPerm]);
    setCreationMode(null);
    resetDraft();
  };

  const handleGenerateAI = () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    // Simulate AI parsing delay
    setTimeout(() => {
      setDraft({
        name: 'AI Generated Policy',
        description: aiPrompt,
        agent:
          agentOptions.find((a) => aiPrompt.toLowerCase().includes(a.toLowerCase())) ||
          agentOptions[0],
        actions:
          aiPrompt.toLowerCase().includes('write') || aiPrompt.toLowerCase().includes('edit')
            ? ['read', 'write']
            : ['read'],
        resources: ['database:*'],
        conditions: aiPrompt.toLowerCase().includes('weekend')
          ? [{ key: 'Time', value: 'WeekdaysOnly' }]
          : [],
      });
      setIsGenerating(false);
      setAiGenerated(true);
    }, 1500);
  };

  /*
  const renderCreationSelect = () => (
    <div className="space-y-8 fade-in">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          How would you like to create this permission?
        </h2>
        <p className="text-text-secondary">
          Choose the method that works best for you. All methods create the same secure permissions
          under the hood.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => setCreationMode('sentence')}
          className="glass p-8 text-left hover:border-accent-primary hover:bg-accent-light/30 transition-all group"
        >
          <div className="w-12 h-12 bg-surface border border-border rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Type size={24} className="text-accent-primary" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">Sentence Builder</h3>
          <p className="text-sm text-text-secondary">
            Fill in the blanks to build a plain-English sentence. Best for simple, straightforward
            rules.
          </p>
        </button>

        <button
          onClick={() => setCreationMode('ai')}
          className="glass p-8 text-left hover:border-purple-400 hover:bg-purple-50 transition-all group"
        >
          <div className="w-12 h-12 bg-surface border border-border rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Sparkles size={24} className="text-purple-500" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">AI Generator</h3>
          <p className="text-sm text-text-secondary">
            Describe what you want to allow in plain English and let our AI write the technical
            policy for you.
          </p>
        </button>

        <button
          onClick={() => setCreationMode('visual')}
          className="glass p-8 text-left hover:border-blue-400 hover:bg-blue-50 transition-all group"
        >
          <div className="w-12 h-12 bg-surface border border-border rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Blocks size={24} className="text-blue-500" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">Visual Blocks</h3>
          <p className="text-sm text-text-secondary">
            Connect colorful building blocks to define who can do what. Great for visual thinkers.
          </p>
        </button>
      </div>
    </div>
  );
  */

  /*
  const renderSentenceBuilder = () => (
    <div className="space-y-8 fade-in">
      <div className="glass p-12 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-light/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <h2 className="text-[10px] font-bold text-accent-primary uppercase tracking-widest mb-10 flex items-center gap-2 relative z-10">
          <Type size={14} /> Sentence Builder
        </h2>
        
        <div className="text-2xl md:text-3xl lg:text-4xl font-display leading-[2.5] md:leading-[2.5] lg:leading-[2.5] text-text-primary flex flex-wrap items-baseline gap-x-3 gap-y-4 relative z-10">
          <span className="font-medium text-text-secondary">Allow</span>
          
          <select 
            value={draft.agent}
            onChange={(e) => setDraft({ ...draft, agent: e.target.value })}
            className="appearance-none bg-transparent border-b-4 border-accent-primary/30 focus:border-accent-primary outline-none text-accent-primary font-bold cursor-pointer text-center hover:bg-accent-light/30 transition-colors px-2 text-inherit font-inherit"
          >
            {agentOptions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          
          <span className="font-medium text-text-secondary">to</span>
          
          <input 
            type="text" 
            value={sentenceAction}
            onChange={(e) => setSentenceAction(e.target.value)}
            className="bg-transparent border-b-4 border-accent-primary/30 focus:border-accent-primary outline-none text-accent-primary font-bold w-40 md:w-56 placeholder:text-accent-primary/40 placeholder:font-normal text-center hover:bg-accent-light/30 transition-colors px-2 text-inherit font-inherit"
            placeholder="e.g. read"
          />
          
          <span className="font-medium text-text-secondary">the</span>
          
          <input 
            type="text" 
            value={sentenceResource}
            onChange={(e) => setSentenceResource(e.target.value)}
            className="bg-transparent border-b-4 border-accent-primary/30 focus:border-accent-primary outline-none text-accent-primary font-bold w-56 md:w-72 placeholder:text-accent-primary/40 placeholder:font-normal text-center hover:bg-accent-light/30 transition-colors px-2 text-inherit font-inherit"
            placeholder="e.g. production DB"
          />
          
          <span className="font-medium text-text-secondary">only if</span>
          
          <input 
            type="text" 
            value={sentenceCondition}
            onChange={(e) => setSentenceCondition(e.target.value)}
            className="bg-transparent border-b-4 border-accent-primary/30 focus:border-accent-primary outline-none text-accent-primary font-bold flex-1 min-w-[250px] placeholder:text-accent-primary/40 placeholder:font-normal text-center hover:bg-accent-light/30 transition-colors px-2 text-inherit font-inherit"
            placeholder="e.g. on office VPN (optional)"
          />
          <span className="font-medium text-text-secondary">.</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <input 
          type="text" 
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          placeholder="Name this permission (e.g. Read DB from Office)"
          className="flex-1 glass px-6 py-4 text-lg focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary"
        />
        <button onClick={handleCreate} className="btn-primary flex items-center justify-center gap-2 px-10 py-4 text-lg shadow-md hover:shadow-lg transition-all">
          Create Permission <Check size={20} />
        </button>
      </div>
    </div>
  );
  */

  const renderAIGenerator = () => (
    <div className="space-y-8 fade-in">
      <div className="glass p-8 md:p-12 relative overflow-hidden">
        <div className="space-y-4 relative z-10">
          <label className="text-xl font-display font-bold text-text-primary block">
            What should this permission do?
          </label>
          <div className="relative">
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. I want to allow the Billing Agent to modify invoices, but only during normal business hours."
              className="w-full h-32 bg-surface border-2 border-purple-100 rounded-xl p-4 focus:outline-none focus:border-purple-400 resize-none text-lg"
            />
            <button
              onClick={handleGenerateAI}
              disabled={isGenerating || !aiPrompt}
              className="absolute bottom-4 right-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-bold transition-colors flex items-center gap-2"
            >
              {isGenerating ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Sparkles size={18} />
              )}
              {isGenerating ? 'Analyzing...' : 'Generate Rule'}
            </button>
          </div>
        </div>

        {aiGenerated && (
          <div className="mt-8 pt-8 border-t border-border animate-in slide-in-from-bottom-4">
            <h3 className="text-sm font-bold text-text-secondary mb-4 uppercase tracking-wider">
              AI Generated Policy
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-surface-hover p-4 rounded-lg border border-border">
                <span className="text-[10px] font-bold text-text-tertiary uppercase block mb-1">
                  Assigned To
                </span>
                <span className="font-bold flex items-center gap-2">
                  <User size={14} className="text-accent-primary" /> {draft.agent}
                </span>
              </div>
              <div className="bg-surface-hover p-4 rounded-lg border border-border">
                <span className="text-[10px] font-bold text-text-tertiary uppercase block mb-1">
                  Actions Allowed
                </span>
                <span className="font-bold flex items-center gap-2">
                  <Activity size={14} className="text-success" /> {draft.actions?.join(', ')}
                </span>
              </div>
              <div className="bg-surface-hover p-4 rounded-lg border border-border">
                <span className="text-[10px] font-bold text-text-tertiary uppercase block mb-1">
                  Conditions
                </span>
                <span className="font-bold flex items-center gap-2">
                  <Settings size={14} className="text-warning" />{' '}
                  {draft.conditions?.length
                    ? draft.conditions.map((c) => c.value).join(', ')
                    : 'None'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {aiGenerated && (
        <div className="flex justify-end gap-4">
          <button onClick={() => setAiGenerated(false)} className="btn-outline">
            Modify Prompt
          </button>
          <button
            onClick={handleCreate}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2 rounded-sm font-bold transition-colors flex items-center gap-2"
          >
            Looks Good, Create <Check size={18} />
          </button>
        </div>
      )}
    </div>
  );

  /*
  const renderVisualBlocks = () => (
    <div className="space-y-8 fade-in">
      <div className="glass p-8 md:p-12 relative overflow-hidden bg-surface-hover/30">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
            <Blocks size={14} /> Visual Rule Builder
          </h2>
          <div className="flex gap-2">
            <select
              value={draft.agent}
              onChange={(e) => setDraft({ ...draft, agent: e.target.value })}
              className="bg-white border border-border p-2 rounded text-sm font-bold outline-none"
            >
              {agentOptions.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="w-full h-[400px]">
          <PolicyFlowDesigner />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          placeholder="Name this visual block rule..."
          className="flex-1 glass px-6 py-4 text-lg focus:outline-none focus:border-accent-primary"
        />
        <button
          onClick={() => {
            // Add some mock data to draft to simulate creating from the flow
            setDraft((prev) => ({
              ...prev,
              actions: ['Human Approval Required'],
              resources: ['Production DB'],
            }));
            handleCreate();
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 px-10 py-4 text-lg rounded-sm font-bold transition-colors shadow-md hover:shadow-lg"
        >
          Deploy Flow <Check size={20} />
        </button>
      </div>
    </div>
  );
  */

  // Main Render Logic
  if (!creationMode) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-8 fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-text-primary">Permissions</h1>
            <p className="text-text-secondary mt-1">
              Manage what your agents can do across the system.
            </p>
          </div>
          <button
            onClick={() => setCreationMode('ai')}
            className="btn-primary flex items-center gap-2 shadow-sm"
          >
            <Plus size={18} />
            Create Permission
          </button>
        </div>

        {permissions.length === 0 ? (
          <div className="glass p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-accent-light text-accent-primary rounded-full flex items-center justify-center mb-4">
              <Shield size={32} />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">No custom permissions</h3>
            <p className="text-text-secondary w-full max-w-[400px] mx-auto mb-6">
              You haven't defined any custom permissions yet. Create rules to accurately model what
              your agents are allowed to access.
            </p>
            <button onClick={() => setCreationMode('ai')} className="btn-primary">
              Create First Permission
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {permissions.map((perm) => (
              <div
                key={perm.id}
                className="glass p-6 hover:border-accent-primary transition-all hover:-translate-y-1 cursor-pointer group shadow-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-surface-hover text-text-primary rounded-lg flex items-center justify-center group-hover:bg-accent-primary group-hover:text-white transition-colors">
                    <User size={20} />
                  </div>
                  <span className="text-[10px] uppercase font-bold bg-surface-hover text-text-secondary px-2 py-1 rounded">
                    {perm.id}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-text-primary mb-1">{perm.name}</h3>
                <p className="text-sm text-accent-primary font-medium mb-4 flex items-center gap-1">
                  For: {perm.agent}
                </p>

                <div className="space-y-3 mt-4 pt-4 border-t border-border">
                  <div className="flex gap-2">
                    <span className="bg-surface-hover text-text-secondary px-2 py-1 rounded text-xs flex-1 flex flex-col">
                      <span className="text-[9px] uppercase font-bold text-text-tertiary mb-1">
                        Can
                      </span>
                      <span className="font-mono text-text-primary">{perm.actions.join(', ')}</span>
                    </span>
                    <span className="bg-surface-hover text-text-secondary px-2 py-1 rounded text-xs flex-1 flex flex-col">
                      <span className="text-[9px] uppercase font-bold text-text-tertiary mb-1">
                        Target
                      </span>
                      <span className="font-mono text-text-primary">
                        {perm.resources.join(', ')}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 fade-in">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => setCreationMode(null)}
          className="w-10 h-10 flex items-center justify-center hover:bg-surface-hover rounded-full transition-colors text-text-secondary border border-border"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            {creationMode === 'ai' && 'AI Permission Generator'}
          </h1>
          <p className="text-text-secondary text-sm">
            Design secure access controls without the technical jargon.
          </p>
        </div>
      </div>

      {/* {creationMode === 'select' && renderCreationSelect()} */}
      {/* {creationMode === 'sentence' && renderSentenceBuilder()} */}
      {creationMode === 'ai' && renderAIGenerator()}
      {/* {creationMode === 'visual' && renderVisualBlocks()} */}
    </div>
  );
}
