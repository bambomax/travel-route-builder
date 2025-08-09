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
import { isRouteBlocked } from './utils';
import type { NodeData } from './types';
import { useDnDContext } from './hooks/useDnDContext';
import { NodeClass } from './NodeClass'

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
      if (isRouteBlocked(nodes, params)) return;

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

      // functional approach:
      // const createdNode = createNode(nodeType, position, parsedData);

      // or using a class:
      const createdNode = new NodeClass({
        id: Date.now().toString(),
        type: nodeType,
        position,
        data: parsedData,
      });

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