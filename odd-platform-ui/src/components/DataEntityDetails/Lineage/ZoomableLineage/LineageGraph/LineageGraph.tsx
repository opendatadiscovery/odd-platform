import React from 'react';
import { type DataEntityLineageById } from 'redux/interfaces';
import Link from './Link/Link';
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

    const { linksUp, crossLinksUp, nodesDown, linksDown, crossLinksDown, nodesUp } =
      React.useMemo(() => {
        const parsedData = parseData(data);
        return generateTree({ parsedData, defaultGraphState, separation, nodeSize });
      }, [data, nodeSize]);

    return (
      <>
        {crossLinksDown?.map((linkData, idx) => (
          <Link
            // eslint-disable-next-line react/no-array-index-key
            key={`link-${linkData.source.data.id}/${idx}-${linkData.target.data.id}/${idx}`}
            linkData={linkData}
          />
        ))}
        {crossLinksUp?.map((linkData, idx) => (
          <Link
            // eslint-disable-next-line react/no-array-index-key
            key={`link-${linkData.source.data.id}/${idx}-${linkData.target.data.id}/${idx}`}
            reverse
            linkData={linkData}
          />
        ))}
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
          <Link
            // eslint-disable-next-line react/no-array-index-key
            key={`link-${linkData.source.data.id}/${idx}-${linkData.target.data.id}/${idx}`}
            reverse
            linkData={linkData}
          />
        ))}
        {linksDown?.map((linkData, idx) => (
          <Link
            // eslint-disable-next-line react/no-array-index-key
            key={`link-${linkData.source.data.id}/${idx}-${linkData.target.data.id}/${idx}`}
            linkData={linkData}
          />
        ))}
      </>
    );
  }
);

export default LineageGraph;
