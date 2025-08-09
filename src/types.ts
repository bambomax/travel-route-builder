import routeBlockRules from './routeBlockRules.json';

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