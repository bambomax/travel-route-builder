import { useState, type ReactNode } from 'react';

import { DnDContext } from './Context';
import type { DnDContextType } from '../../types';

export const DnDProvider = ({ children }: { children: ReactNode }) => {
  const [nodeType, setNodeType] = useState<DnDContextType['nodeType']>(null);

  return (
    <DnDContext.Provider value={{ nodeType, setNodeType }}>
      {children}
    </DnDContext.Provider>
  );
}
