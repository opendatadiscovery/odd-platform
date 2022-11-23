import React from 'react';
import AppGraphLink from 'components/shared/AppGraph/AppGraphLink/AppGraphLink';
import { type DataEntityLineageById } from 'redux/interfaces';
import { type LineageGraphState } from '../../lineageLib/interfaces';
import { defaultGraphState } from '../../lineageLib/constants';
import { generateTree, parseData } from '../../lineageLib/generateGraph';
import LineageContext from '../../lineageLib/LineageContext/LineageContext';
import Node from './Node/Node';

interface LineageGraphProps {
  dataEntityId: number;
  data: DataEntityLineageById;
  handleDepthChange: (depth: number) => void;
}

const LineageGraph = React.memo<LineageGraphProps>(
  ({ data, dataEntityId, handleDepthChange }) => {
    const { nodeSize } = React.useContext(LineageContext);

    const separation = { siblings: 1, nonSiblings: 1 };

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
      setGraphState(
        generateTree({ parsedData, defaultGraphState, separation, nodeSize })
      );
    }, [data, nodeSize]);

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
          <Node
            streamType='upstream'
            rootNodeId={dataEntityId}
            key={`node-${node.x}${node.y}`}
            reverse
            data={node.data}
            position={{ x: node.x, y: node.y }}
            parent={node.parent}
            hasChildren={!!node.children?.length}
            nodeDepth={node.depth}
            setInitialDepth={handleDepthChange}
          />
        ))}
        {nodesDown?.map(node => (
          <Node
            streamType='downstream'
            rootNodeId={dataEntityId}
            key={`node-${node.x}${node.y}`}
            data={node.data}
            position={{ x: node.x, y: node.y }}
            parent={node.parent}
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
          />
        ))}
        {linksDown?.map((linkData, idx) => (
          <AppGraphLink
            // eslint-disable-next-line react/no-array-index-key
            key={`link-${linkData.source.data.id}/${idx}-${linkData.target.data.id}/${idx}`}
            linkData={linkData}
            nodeSize={nodeSize}
          />
        ))}
      </>
    );
  }
);

export default LineageGraph;
