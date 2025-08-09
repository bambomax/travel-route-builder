import { useRef, useEffect, useState, useCallback, type DragEvent } from 'react';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Controls,
  Panel,
  ReactFlow,
  useReactFlow,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import CountryNode from './Components/Nodes/CountryNode';
import Search from './Components/Search/Search';
import { NODE_TYPE_COUNTRY, RESTORE_FLOW_KEY } from './constants';
import { createNode, isRouteBlocked } from './utils';
import type { Country, NodeData, RouteBlockKey } from './types';
import { useDnDContext } from './hooks/useDnDContext';

const rfStyle = {
  backgroundColor: '#EFF1FF',
};

const nodeTypes = {
  [NODE_TYPE_COUNTRY]: CountryNode,
};

export default function App() {
  const [nodes, setNodes] = useState<Node<NodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const reactFlowWrapper = useRef(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance<Node<NodeData>, Edge> | null>(null);
  const { screenToFlowPosition, setViewport } = useReactFlow();
  const { nodeType, setNodeType } = useDnDContext();

  const onNodesChange = useCallback(
    (changes: NodeChange<Node<NodeData>>[]) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );

  const onConnect = useCallback(
    (params: Connection) => {
      const sourceNode = nodes.find(node => node.id === params.source);
      const targetNode = nodes.find(node => node.id === params.target);

      let sourceLabel = 'Unsupported Node';
      let targetLabel = 'Unsupported Node';

      if (sourceNode?.type === NODE_TYPE_COUNTRY) {
        sourceLabel = (sourceNode.data as Country)?.name.common;
      }

      if (targetNode?.type === NODE_TYPE_COUNTRY) {
        targetLabel = (targetNode.data as Country)?.name.common;
      }

      if (sourceLabel && targetLabel && sourceLabel === targetLabel) {
        alert('Cannot connect a node to itself.');
        return;
      }

      if (sourceLabel && targetLabel && isRouteBlocked(sourceLabel as RouteBlockKey, targetLabel)) {
        alert(`Route blocked: ${sourceLabel} -> ${targetLabel}`);
        return;
      }

      setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot))
    },
    [nodes],
  );

  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      localStorage.setItem(RESTORE_FLOW_KEY, JSON.stringify(flow));
    }
  }, [rfInstance]);

  useEffect(() => {
    const restoreFlow = async () => {
      const storage = localStorage.getItem(RESTORE_FLOW_KEY);

      if (!storage) return;

      const flow = JSON.parse(storage);

      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport;
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        setViewport({ x, y, zoom });
      }
    };

    restoreFlow();

    window.addEventListener('beforeunload', onSave);

    return () => {
      window.removeEventListener('beforeunload', onSave);
    };
  }, [setViewport, onSave]);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      if (!nodeType) return;

      setNodeType(null);

      const data = event.dataTransfer.getData(nodeType);
      if (!data) return;

      const parsedData: NodeData = JSON.parse(data);

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const createdNode = createNode(nodeType, position, parsedData);

      setNodes((nodes) => [...nodes, createdNode]);
    },
    [nodeType, setNodeType, screenToFlowPosition]
  );

  return (
    <div style={{ width: '100vw', height: '100vh' }} ref={reactFlowWrapper}>
      <ReactFlow<Node<NodeData>, Edge>
        onInit={setRfInstance}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={(event) => event.preventDefault()}
        fitView
        style={rfStyle}
      >
        <Panel position="top-center">
          <Search />
        </Panel>
        <Controls />
      </ReactFlow>
    </div>
  );
}