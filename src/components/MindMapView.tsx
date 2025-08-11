import React, { useState, useEffect, useCallback } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  Settings,
  Plus,
  Search
} from 'lucide-react';
import { WorkspaceConfig } from '../hooks/useWorkspace';

// Simple node and edge types for our mind map
interface MindMapNode {
  id: string;
  type: 'file' | 'folder' | 'note' | 'tag';
  label: string;
  path?: string;
  x: number;
  y: number;
  connections: string[];
}

interface MindMapEdge {
  id: string;
  source: string;
  target: string;
  type: 'reference' | 'parent' | 'tag';
}

interface MindMapViewProps {
  workspace: WorkspaceConfig;
}

const MindMapView: React.FC<MindMapViewProps> = ({ workspace }) => {
  const [nodes, setNodes] = useState<MindMapNode[]>([]);
  const [edges, setEdges] = useState<MindMapEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    generateMindMap();
  }, [workspace]);

  const generateMindMap = async () => {
    try {
      // Generate nodes from workspace structure
      const workspaceNodes = await generateNodesFromWorkspace();
      setNodes(workspaceNodes);
      
      // Generate edges based on relationships
      const workspaceEdges = generateEdgesFromNodes(workspaceNodes);
      setEdges(workspaceEdges);
    } catch (error) {
      console.error('Failed to generate mind map:', error);
    }
  };

  const generateNodesFromWorkspace = async (): Promise<MindMapNode[]> => {
    const nodes: MindMapNode[] = [];
    const centerX = 400;
    const centerY = 300;
    
    // Add root workspace node
    nodes.push({
      id: 'root',
      type: 'folder',
      label: workspace.name,
      path: workspace.path,
      x: centerX,
      y: centerY,
      connections: []
    });

    // Add PARA structure nodes
    const paraFolders = ['Projects', 'Areas', 'Resources', 'Archive'];
    paraFolders.forEach((folder, index) => {
      const angle = (index * Math.PI * 2) / paraFolders.length;
      const radius = 150;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      nodes.push({
        id: folder.toLowerCase(),
        type: 'folder',
        label: folder,
        path: `${workspace.path}/${folder}`,
        x,
        y,
        connections: ['root']
      });
    });

    // Add recent notes as smaller nodes around the structure
    try {
      const recentNotes = await findRecentNotes();
      recentNotes.forEach((note, index) => {
        const parentFolder = getParentFolder(note.path);
        const parentNode = nodes.find(n => n.id === parentFolder);
        
        if (parentNode) {
          const angle = (index * Math.PI * 2) / Math.max(recentNotes.length, 1);
          const radius = 80;
          const x = parentNode.x + Math.cos(angle) * radius;
          const y = parentNode.y + Math.sin(angle) * radius;
          
          nodes.push({
            id: note.path,
            type: 'note',
            label: note.name,
            path: note.path,
            x,
            y,
            connections: [parentFolder]
          });
        }
      });
    } catch (error) {
      console.warn('Failed to load recent notes for mind map:', error);
    }

    return nodes;
  };

  const findRecentNotes = async () => {
    // This would integrate with the notes loading logic
    // For now, return a mock structure
    return [
      { path: `${workspace.path}/Projects/project1.md`, name: 'Project 1' },
      { path: `${workspace.path}/Areas/health.md`, name: 'Health Notes' },
      { path: `${workspace.path}/Resources/learning.md`, name: 'Learning Resources' },
    ];
  };

  const getParentFolder = (filePath: string): string => {
    if (filePath.includes('/Projects/')) return 'projects';
    if (filePath.includes('/Areas/')) return 'areas';
    if (filePath.includes('/Resources/')) return 'resources';
    if (filePath.includes('/Archive/')) return 'archive';
    return 'root';
  };

  const generateEdgesFromNodes = (nodes: MindMapNode[]): MindMapEdge[] => {
    const edges: MindMapEdge[] = [];
    
    nodes.forEach(node => {
      node.connections.forEach(connectionId => {
        edges.push({
          id: `${node.id}-${connectionId}`,
          source: connectionId,
          target: node.id,
          type: 'parent'
        });
      });
    });
    
    return edges;
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(selectedNode === nodeId ? null : nodeId);
    const node = nodes.find(n => n.id === nodeId);
    if (node?.path && node.type === 'note') {
      // Open note in notes view
      console.log('Opening note:', node.path);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.2, 0.3));
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const renderNode = (node: MindMapNode) => {
    const isSelected = selectedNode === node.id;
    const nodeSize = node.type === 'folder' ? 60 : 40;
    const fontSize = node.type === 'folder' ? 12 : 10;
    
    let nodeColor = '#6366f1';
    if (node.type === 'note') nodeColor = '#8b5cf6';
    if (node.type === 'tag') nodeColor = '#06b6d4';
    
    return (
      <g key={node.id}>
        {/* Node circle */}
        <circle
          cx={node.x}
          cy={node.y}
          r={nodeSize / 2}
          fill={isSelected ? nodeColor : '#ffffff'}
          stroke={nodeColor}
          strokeWidth={isSelected ? 3 : 2}
          className="cursor-pointer hover:fill-opacity-80 transition-all"
          onClick={() => handleNodeClick(node.id)}
        />
        
        {/* Node icon */}
        <text
          x={node.x}
          y={node.y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fontSize}
          fill={isSelected ? '#ffffff' : nodeColor}
          className="pointer-events-none font-semibold"
        >
          {node.type === 'folder' ? '📁' : node.type === 'note' ? '📝' : '🏷️'}
        </text>
        
        {/* Node label */}
        <text
          x={node.x}
          y={node.y + nodeSize / 2 + 15}
          textAnchor="middle"
          fontSize="10"
          fill="#374151"
          className="pointer-events-none"
        >
          {node.label.length > 12 ? `${node.label.substring(0, 12)}...` : node.label}
        </text>
      </g>
    );
  };

  const renderEdge = (edge: MindMapEdge) => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    
    if (!sourceNode || !targetNode) return null;
    
    let strokeColor = '#d1d5db';
    if (edge.type === 'reference') strokeColor = '#6366f1';
    if (edge.type === 'tag') strokeColor = '#06b6d4';
    
    return (
      <line
        key={edge.id}
        x1={sourceNode.x}
        y1={sourceNode.y}
        x2={targetNode.x}
        y2={targetNode.y}
        stroke={strokeColor}
        strokeWidth={edge.type === 'parent' ? 2 : 1}
        strokeDasharray={edge.type === 'reference' ? '5,5' : undefined}
        className="pointer-events-none"
      />
    );
  };

  return (
    <div className="h-full bg-vault-bg relative overflow-hidden">
      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 bg-vault-surface rounded-lg shadow-sm border p-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomIn}
            className="btn-ghost p-2"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={handleZoomOut}
            className="btn-ghost p-2"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={handleResetView}
            className="btn-ghost p-2"
            title="Reset View"
          >
            <RotateCcw size={16} />
          </button>
          <div className="w-px h-6 bg-gray-200 mx-1"></div>
          <button className="btn-ghost p-2" title="Export">
            <Download size={16} />
          </button>
          <button className="btn-ghost p-2" title="Settings">
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Info Panel */}
      <div className="absolute top-4 right-4 z-10 bg-vault-surface rounded-lg shadow-sm border p-4 max-w-xs">
        <h3 className="font-semibold text-vault-text mb-2">Mind Map</h3>
        <p className="text-sm text-vault-text-secondary mb-3">
          Visualize your workspace structure and connections between notes.
        </p>
        <div className="space-y-2 text-xs text-vault-text-secondary">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-vault-primary rounded-full"></div>
            <span>Folders</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-vault-secondary rounded-full"></div>
            <span>Notes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-vault-accent rounded-full"></div>
            <span>Tags</span>
          </div>
        </div>
        
        {selectedNode && (
          <div className="mt-4 pt-3 border-t">
            <div className="font-medium text-sm text-vault-text">
              {nodes.find(n => n.id === selectedNode)?.label}
            </div>
            <div className="text-xs text-vault-text-secondary">
              {nodes.find(n => n.id === selectedNode)?.type}
            </div>
          </div>
        )}
      </div>

      {/* SVG Canvas */}
      <svg
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <g
          transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}
        >
          {/* Render edges first (behind nodes) */}
          {edges.map(renderEdge)}
          
          {/* Render nodes */}
          {nodes.map(renderNode)}
        </g>
      </svg>

      {/* Empty State */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-vault-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-vault-primary" size={32} />
            </div>
            <h3 className="text-lg font-medium text-vault-text mb-2">
              Generating Mind Map
            </h3>
            <p className="text-vault-text-secondary">
              Analyzing your workspace structure...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MindMapView;
