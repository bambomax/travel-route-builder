import type { FC } from 'react';
import type { Node, NodeProps } from '@xyflow/react';
import { Handle, Position } from '@xyflow/react';

import type { Country } from '../../types';
import styles from './CountryNode.module.css';

const CountryNode: FC<NodeProps<Node<Country>>> = ({ data }) => {
  const { flags, name } = data;

  return (
    <div className={styles.country}>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} id="a" style={{ left: '25%' }} />
      <Handle type="source" position={Position.Bottom} id="b" style={{ left: '75%' }} />

      <div className={styles.flagWrapper}>
        <img src={flags.svg} alt={flags.alt} className={styles.countryFlag} />
      </div>
      <div className={styles.nameWrapper}>
        <span className={styles.countryName}>{name.common}</span>
      </div>
    </div>
  );
};

export default CountryNode;