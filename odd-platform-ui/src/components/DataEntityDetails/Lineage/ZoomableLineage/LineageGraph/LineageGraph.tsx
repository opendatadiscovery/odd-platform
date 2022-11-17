import React from 'react';
import AppGraphCrossLink from 'components/shared/AppGraph/AppGraphCrossLink/AppGraphCrossLink';
import AppGraphNode from 'components/shared/AppGraph/AppGraphNode/AppGraphNode';
import AppGraphLink from 'components/shared/AppGraph/AppGraphLink/AppGraphLink';
import { HierarchyPointLink, HierarchyPointNode } from 'd3-hierarchy';
import { DataEntityLineageById, TreeLinkDatum, TreeNodeDatum } from 'redux/interfaces';
import { LineageGraphState } from 'components/DataEntityDetails/Lineage/lineageLib/interfaces';
import {
  defaultGraphState,
  nodeSizeInitial,
} from 'components/DataEntityDetails/Lineage/lineageLib/constants';
import { SelectChangeEvent } from '@mui/material';
import {
  generateTree,
  parseData,
} from 'components/DataEntityDetails/Lineage/lineageLib/generateGraph';

interface LineageGraphProps {
  dataEntityId: number;
  data: DataEntityLineageById;
  compactView: boolean;
  handleDepthChange: (depth: number) => void;
}

const LineageGraph: React.FC<LineageGraphProps> = ({
  data,
  compactView,
  dataEntityId,
  handleDepthChange,
}) => {
  const [nodeSize, setNodeSize] = React.useState(nodeSizeInitial);
  const separation = { siblings: 1, nonSiblings: 1 };

  React.useEffect(() => {
    setNodeSize({ ...nodeSizeInitial, y: compactView ? 56 : 160 });
  }, [compactView]);

  const [
    {
      nodesUp,
      linksUp,
      crossLinksUp,
      replacedCrossLinksUp,
      nodesDown,
      linksDown,
      crossLinksDown,
      replacedCrossLinksDown,
      // TODO depth unnecessary?
      depth,
    },
    setGraphState,
  ] = React.useState<LineageGraphState>(defaultGraphState);

  React.useEffect(() => {
    const parsedData = parseData(data);
    setGraphState(generateTree({ parsedData, defaultGraphState, separation, nodeSize }));
  }, [data, nodeSize]);
  console.log('nodes', nodesUp, nodesDown);
  return (
    <>
      {/* {crossLinksDown?.map((linkData, idx) => ( */}
      {/*   <AppGraphCrossLink */}
      {/*     // eslint-disable-next-line react/no-array-index-key */}
      {/*     key={`link-${linkData.source.data.id}/${idx}-${linkData.target.data.id}/${idx}`} */}
      {/*     linkData={linkData} */}
      {/*     nodeSize={nodeSize} */}
      {/*     // enableLegacyTransitions={enableLegacyTransitions} */}
      {/*     // transitionDuration={transitionDuration} */}
      {/*     replacedCrossLinks={replacedCrossLinksDown} */}
      {/*   /> */}
      {/* ))} */}
      {/* {crossLinksUp?.map((linkData, idx) => ( */}
      {/*   <AppGraphCrossLink */}
      {/*     // eslint-disable-next-line react/no-array-index-key */}
      {/*     key={`link-${linkData.source.data.id}/${idx}-${linkData.target.data.id}/${idx}`} */}
      {/*     reverse */}
      {/*     linkData={linkData} */}
      {/*     nodeSize={nodeSize} */}
      {/*     // enableLegacyTransitions={enableLegacyTransitions} */}
      {/*     // transitionDuration={transitionDuration} */}
      {/*     replacedCrossLinks={replacedCrossLinksUp} */}
      {/*   /> */}
      {/* ))} */}
      {nodesUp?.map(node => (
        <AppGraphNode
          appGraphNodeType='upstream'
          rootNodeId={dataEntityId}
          key={`node-${node.x}${node.y}`}
          reverse
          data={node.data}
          position={{ x: node.x, y: node.y }}
          parent={node.parent}
          nodeSize={nodeSize}
          compactView={compactView}
          // enableLegacyTransitions={enableLegacyTransitions}
          // transitionDuration={transitionDuration}
          hasChildren={!!node.children?.length}
          nodeDepth={node.depth}
          setInitialDepth={handleDepthChange}
        />
      ))}
      {nodesDown?.map(node => (
        <AppGraphNode
          appGraphNodeType='downstream'
          rootNodeId={dataEntityId}
          key={`node-${node.x}${node.y}`}
          data={node.data}
          position={{ x: node.x, y: node.y }}
          parent={node.parent}
          nodeSize={nodeSize}
          compactView={compactView}
          // enableLegacyTransitions={enableLegacyTransitions}
          // transitionDuration={transitionDuration}
          hasChildren={!!node.children?.length}
          nodeDepth={node.depth}
          setInitialDepth={handleDepthChange}
        />
      ))}

      {linksUp?.map((linkData, idx) => (
        <AppGraphLink
          // eslint-disable-next-line react/no-array-index-key
          key={`link-${linkData.source.data.id}/${idx}-${linkData.target.data.id}/${idx}`}
          reverse
          linkData={linkData}
          nodeSize={nodeSize}
          // enableLegacyTransitions={enableLegacyTransitions}
          // transitionDuration={transitionDuration}
        />
      ))}
      {linksDown?.map((linkData, idx) => (
        <AppGraphLink
          // eslint-disable-next-line react/no-array-index-key
          key={`link-${linkData.source.data.id}/${idx}-${linkData.target.data.id}/${idx}`}
          linkData={linkData}
          nodeSize={nodeSize}
          // enableLegacyTransitions={enableLegacyTransitions}
          // transitionDuration={transitionDuration}
        />
      ))}
    </>
  );
};

export default LineageGraph;
