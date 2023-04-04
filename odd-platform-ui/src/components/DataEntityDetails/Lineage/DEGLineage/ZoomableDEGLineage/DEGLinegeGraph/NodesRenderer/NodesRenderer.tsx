import React, { memo } from 'react';
import type { Node as NodeType } from '../../../lib/interfaces';
import Node from '../../../components/Node/Node';

interface NodesRendererProps {
  nodes: NodeType[];
  handleOnNodeMouseEnter: (nodeId: string) => void;
  handleOnNodeMouseLeave: () => void;
}

const NodesRenderer: React.FC<NodesRendererProps> = ({
  nodes,
  handleOnNodeMouseEnter,
  handleOnNodeMouseLeave,
}) => (
  <>
    {nodes.map(node => (
      <Node
        key={node.id}
        id={node.id}
        x={node.x}
        y={node.y}
        data={node.data}
        fullView={node.fullView}
        handleOnNodeMouseEnter={handleOnNodeMouseEnter}
        handleOnNodeMouseLeave={handleOnNodeMouseLeave}
      />
    ))}
  </>
);

export default memo(NodesRenderer);
