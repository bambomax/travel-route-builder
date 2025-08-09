import type { Node, XYPosition } from '@xyflow/react';

import type { NodeType, RouteBlockKey } from './types.ts';
import routeBlockRules from './routeBlockRules.json';

export function createNode<T extends Record<string, unknown>>(
  type: NodeType,
  position: XYPosition,
  data: T
): Node<T> {
  return {
    id: Date.now().toString(),
    type,
    position,
    data,
  };
}

export const isRouteBlocked = (source: RouteBlockKey, target: string) =>
  routeBlockRules[source]?.block.includes(target);
