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
import { DRAG_TYPE_COUNTRY, NODE_TYPE_COUNTRY, RESTORE_FLOW_KEY } from './constants.ts';
import { createCountryNode, isRouteBlocked } from './utils.ts';
import type { Country, RouteBlockKey } from './types.ts';

const rfStyle = {
  backgroundColor: '#EFF1FF',
};

const nodeTypes = {
  [NODE_TYPE_COUNTRY]: CountryNode,
};

export default function App() {
  const [nodes, setNodes] = useState<Node<Country>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const reactFlowWrapper = useRef(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance<Node<Country>, Edge> | null>(null);
  const { screenToFlowPosition, setViewport } = useReactFlow();

  const onNodesChange = useCallback(
    (changes: NodeChange<Node<Country>>[]) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
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
      const sourceLabel = sourceNode?.data?.name.common;
      const targetLabel = targetNode?.data?.name.common;

      if (sourceLabel && targetLabel && sourceLabel === targetLabel) {
        alert('Cannot connect a country to itself.');
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

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const data = event.dataTransfer.getData(DRAG_TYPE_COUNTRY);
      if (!data) return;

      const country: Country = JSON.parse(data);

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const countryNode = createCountryNode(country, position);

      setNodes((nodes) => [...nodes, countryNode]);
    },
    [screenToFlowPosition]
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

  return (
    <div style={{ width: '100vw', height: '100vh' }} ref={reactFlowWrapper}>
      <ReactFlow<Node<Country>, Edge>
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