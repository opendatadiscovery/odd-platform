import type { FC } from 'react';
import React, { useLayoutEffect, useRef } from 'react';
import { useSetAtom } from 'jotai/index';
import {
  edgesAtom,
  graphHeightAtom,
  graphWidthAtom,
  isLayoutedAtom,
  nodesAtom,
} from '../lib/atoms';
import type { Edge as EdgeType, Node as NodeType } from '../lib/interfaces';
import Node from '../components/Node/Node';
import { NODE_HEIGHT, NODE_WIDTH } from '../lib/constants';
import layoutDEGLineage from '../lib/layoutDEGLineage';

interface DEGLineageLayouterProps {
  nodes: NodeType[];
  edges: EdgeType[];
}

const DEGLineageLayouter: FC<DEGLineageLayouterProps> = ({ nodes, edges }) => {
  const nodesRefsById = useRef<{ [nodeId: string]: HTMLDivElement | null }>({});

  const setNodes = useSetAtom(nodesAtom);
  const setEdges = useSetAtom(edgesAtom);
  const setGraphWidth = useSetAtom(graphWidthAtom);
  const setGraphHeight = useSetAtom(graphHeightAtom);
  const setIsLayouted = useSetAtom(isLayoutedAtom);

  useLayoutEffect(() => {
    const nodesWithSizes = nodes.map(node => ({
      ...node,
      width: NODE_WIDTH,
      height: nodesRefsById.current[node.id]?.clientHeight || NODE_HEIGHT,
    }));

    layoutDEGLineage({
      nodes: nodesWithSizes,
      edges,
      setGraphWidth,
      setIsLayouted,
      setEdges,
      setGraphHeight,
      setNodes,
    });
  }, []);

  return (
    <>
      {nodes.map(node => (
        <Node
          hidden
          key={node.id}
          id={node.id}
          data={node.data}
          ref={el => {
            nodesRefsById.current[node.id] = el;
          }}
        />
      ))}
    </>
  );
};

export default DEGLineageLayouter;
