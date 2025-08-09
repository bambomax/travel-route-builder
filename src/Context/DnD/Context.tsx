import { createContext } from 'react';

import type { DnDContextType } from '../../types';

export const DnDContext = createContext<DnDContextType>({
  nodeType: null,
  setNodeType: () => {},
});
