import routeBlockRules from './routeBlockRules.json';
import type { Dispatch, SetStateAction } from 'react';

import { NODE_TYPE_COUNTRY } from './constants.ts';

export type NodeType = typeof NODE_TYPE_COUNTRY;
export type NodeData = Country | { label: string };

export type DnDContextType = {
  nodeType: NodeType | null;
  setNodeType: Dispatch<SetStateAction<NodeType | null>>;
};

export type Country = {
  flags: {
    png: string;
    svg: string;
    alt: string;
  };
  name: {
    common: string;
    official: string;
    nativeName: Record<string, { official: string; common: string }>;
  };
};

export type RouteBlockKey = keyof typeof routeBlockRules;
