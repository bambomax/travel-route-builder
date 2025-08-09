import type { Node } from '@xyflow/react';

import { NODE_TYPE_COUNTRY } from './constants.ts';
import type { Country, RouteBlockKey } from './types.ts';
import routeBlockRules from './routeBlockRules.json';

export const createCountryNode = (data: Country, position = { x: 0, y: 0 }): Node<Country> => ({
  id: new Date().getTime().toString(),
  type: NODE_TYPE_COUNTRY,
  position,
  data,
});

export const isRouteBlocked = (source: RouteBlockKey, target: string) =>
  routeBlockRules[source]?.block.includes(target);
