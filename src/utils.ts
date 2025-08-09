import type { Node, XYPosition } from '@xyflow/react';

import type { NodeType, NodeData, RouteBlockKey } from './types.ts';
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

export const isRouteBlocked = (source: RouteBlockKey, target: string) =>
  routeBlockRules[source]?.block.includes(target);
