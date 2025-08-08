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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import CountryNode from './Components/Nodes/CountryNode';
import Search from './Components/Search/Search';
import { DRAG_TYPE_COUNTRY, NODE_TYPE_COUNTRY, RESTORE_FLOW_KEY } from './constants.ts';
import { createCountryNode } from './utils.ts';
import type { Country } from './types.ts';

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
  const [rfInstance, setRfInstance] = useState<ReactFlow | null>(null);
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
    (params: Connection) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
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
      const flow = JSON.parse(localStorage.getItem(RESTORE_FLOW_KEY));

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