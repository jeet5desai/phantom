

import React, { useCallback } from 'react';
import ReactFlow, { 
  addEdge, 
  Background, 
  Controls, 
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Connection,
  Edge,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Zap, UserRoundCheck, Lock, Terminal, LucideIcon } from 'lucide-react';

interface SecurityNodeProps {
  data: {
    label: string;
    name: string;
    icon: LucideIcon;
    type: 'trigger' | 'action';
  };
  selected?: boolean;
}

// Custom Node Components
const SecurityNode = ({ data, selected }: SecurityNodeProps) => {
  const Icon = data.icon;
  return (
    <div className={`p-4 rounded-xl border-2 transition-all min-w-[180px] ${
      selected ? 'border-accent-primary bg-accent-light' : 'border-border bg-white'
    }`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-accent-primary border-none" />
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          data.type === 'action' ? 'bg-accent-primary text-white' : 'bg-surface-hover text-text-secondary'
        }`}>
          <Icon size={20} />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-text-tertiary uppercase tracking-tighter">{data.label}</span>
          <span className="text-sm font-bold text-text-primary">{data.name}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-accent-primary border-none" />
    </div>
  );
};

const nodeTypes = {
  securityNode: SecurityNode,
};

const initialNodes = [
  {
    id: '1',
    type: 'securityNode',
    data: { label: 'Input', name: 'Agent Request', icon: Terminal, type: 'trigger' },
    position: { x: 50, y: 150 },
  },
  {
    id: '2',
    type: 'securityNode',
    data: { label: 'Filter', name: 'PII Redaction', icon: Zap, type: 'action' },
    position: { x: 300, y: 50 },
  },
  {
    id: '3',
    type: 'securityNode',
    data: { label: 'Auth', name: 'Human Approval', icon: UserRoundCheck, type: 'action' },
    position: { x: 300, y: 250 },
  },
  {
    id: '4',
    type: 'securityNode',
    data: { label: 'Target', name: 'Production DB', icon: Lock, type: 'trigger' },
    position: { x: 600, y: 150 },
  },
];

const initialEdges = [
  { 
    id: 'e1-2', 
    source: '1', 
    target: '2', 
    animated: true, 
    style: { stroke: '#E07A3A' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#E07A3A' }
  },
  { 
    id: 'e1-3', 
    source: '1', 
    target: '3', 
    animated: true, 
    style: { stroke: '#E07A3A' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#E07A3A' }
  },
  { 
    id: 'e2-4', 
    source: '2', 
    target: '4', 
    style: { stroke: '#C8C5BD' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#C8C5BD' }
  },
  { 
    id: 'e3-4', 
    source: '3', 
    target: '4', 
    style: { stroke: '#C8C5BD' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#C8C5BD' }
  },
];

export default function PolicyFlowDesigner() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#E07A3A' } }, eds)),
    [setEdges]
  );

  return (
    <div className="w-full h-[500px] glass overflow-hidden relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background color="#E8E6E0" gap={20} />
        <Controls showInteractive={false} className="bg-white border-border" />
        <MiniMap 
          nodeColor={(n) => n.data.type === 'action' ? '#E07A3A' : '#F7F6F3'}
          maskColor="rgba(247, 246, 243, 0.7)"
          className="bg-white border border-border rounded-lg"
        />
      </ReactFlow>
      
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <div className="px-3 py-1 bg-accent-primary text-white text-[10px] font-bold rounded-full uppercase tracking-widest ">
          Live Editor
        </div>
      </div>
    </div>
  );
}
