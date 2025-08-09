import routeBlockRules from './routeBlockRules.json';
import type { Dispatch, SetStateAction } from 'react';

export type NodeType = 'country' | 'hotel' | 'airport';
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
