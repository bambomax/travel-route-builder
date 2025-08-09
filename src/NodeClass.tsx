import type { Node, XYPosition } from '@xyflow/react';
import type { NodeType, NodeData } from './types.ts';

interface NodeClassProps extends Node {
  type: NodeType;
  position: XYPosition;
  data: NodeData;
  // support additional properties
  [key: string]: unknown;
}

export class NodeClass {
  id: string;
  type: NodeType;
  position: XYPosition;
  data: NodeData;
  // support additional properties like color, textNotes, etc.
  [key: string]: unknown;

  constructor(props: NodeClassProps) {
    this.id = props.id;
    this.type = props.type;
    this.position = props.position;
    this.data = props.data;
    // support additional properties like color, textNotes, etc.
    Object.keys(props).forEach(key => {
      if (!(key in this)) {
        this[key] = props[key];
      }
    });
  }
}
