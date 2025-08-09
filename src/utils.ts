import type { Connection, Node, XYPosition } from '@xyflow/react';

import { NODE_TYPE_COUNTRY } from './constants.ts';
import type { NodeType, NodeData, RouteBlockKey, Country } from './types.ts';
import routeBlockRules from './routeBlockRules.json';

export function createNode(
  type: NodeType,
  position: XYPosition,
  data: NodeData,
): Node<NodeData> {
  return {
    id: Date.now().toString(),
    type,
    position,
    data,
  };
}

export const isCountryNode = (node: Node<NodeData>): node is Node<Country> =>
  node?.type === NODE_TYPE_COUNTRY;

export const isRouteBlocked = (nodes: Node<NodeData>[], params: Connection): boolean => {
  const sourceNode = nodes.find(node => node.id === params.source);
  const targetNode = nodes.find(node => node.id === params.target);

  if (!sourceNode || !targetNode) {
    console.warn('Source or target node not found');
    return false;
  }

  let sourceLabel = '';
  let targetLabel = '';

  if (isCountryNode(sourceNode)) {
    sourceLabel = sourceNode.data.name.common;
  }

  if (isCountryNode(targetNode)) {
    targetLabel = targetNode.data.name.common;
  }

  if (sourceLabel && targetLabel && sourceLabel === targetLabel) {
    alert(`Cannot connect a/an ${sourceNode.type} to itself.`);
    return true;
  }

  if (sourceLabel && targetLabel && routeBlockRules[sourceLabel as RouteBlockKey]?.block.includes(targetLabel)) {
    alert(`Route blocked: ${sourceLabel} -> ${targetLabel}`);
    return true;
  }

  return false;
}
