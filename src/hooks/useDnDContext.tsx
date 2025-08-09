import { useContext } from 'react';

import { DnDContext } from '../Context/DnD/Context';
import type { DnDContextType } from '../types';

export const useDnDContext = () => {
  return useContext<DnDContextType>(DnDContext);
}
