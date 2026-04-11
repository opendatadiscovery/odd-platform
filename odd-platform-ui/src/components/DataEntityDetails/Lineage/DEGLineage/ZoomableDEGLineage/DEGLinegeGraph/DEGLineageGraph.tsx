import React, { memo, type FC } from 'react';
import useDEGLineage from '../../lib/hooks/useDEGLineage';
import NodesRenderer from './NodesRenderer/NodesRenderer';
import EdgesRenderer from './EdgesRenderer/EdgesRenderer';

const DEGLineageGraph: FC = () => {
  const { nodes, edges, handleOnNodeMouseEnter, handleOnNodeMouseLeave } =
    useDEGLineage();

  return (
    <>
      <NodesRenderer
        nodes={nodes}
        handleOnNodeMouseEnter={handleOnNodeMouseEnter}
        handleOnNodeMouseLeave={handleOnNodeMouseLeave}
      />
      <EdgesRenderer edges={edges} />
    </>
  );
};

export default memo(DEGLineageGraph);
