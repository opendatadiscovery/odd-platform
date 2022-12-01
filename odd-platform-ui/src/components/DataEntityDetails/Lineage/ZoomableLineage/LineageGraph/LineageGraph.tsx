import React from 'react';
import { type DataEntityLineageById } from 'redux/interfaces';
import { setHighlightedLinksFirst } from 'components/DataEntityDetails/Lineage/lineageLib/helpers';
import CrossLink from 'components/DataEntityDetails/Lineage/ZoomableLineage/LineageGraph/CrossLink/CrossLink';
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
    const { nodeSize, setRenderedNodes, setRenderedLinks, fullTitles, highLightedLinks } =
      React.useContext(LineageContext);

    const separation = { siblings: 1, nonSiblings: 1 };

    const { linksUp, crossLinksUp, nodesDown, linksDown, crossLinksDown, nodesUp } =
      React.useMemo(() => {
        const parsedData = parseData(data);
        return generateTree({ parsedData, defaultGraphState, separation, nodeSize });
      }, [data, nodeSize]);

    React.useEffect(() => {
      setRenderedNodes([...nodesUp, ...nodesDown]);
    }, [fullTitles, data]);

    React.useEffect(() => {
      setRenderedLinks([...linksDown, ...crossLinksDown, ...linksUp, ...crossLinksUp]);
    }, [data]);

    return (
      <>
        {setHighlightedLinksFirst(linksUp, highLightedLinks, true).map(linkData => (
          <Link
            key={`link-${linkData.target.data.d3attrs.id}-${linkData.source.data.d3attrs.id}`}
            reverse
            linkData={linkData}
          />
        ))}
        {setHighlightedLinksFirst(linksDown, highLightedLinks, false).map(linkData => (
          <Link
            key={`link-${linkData.target.data.d3attrs.id}-${linkData.source.data.d3attrs.id}`}
            linkData={linkData}
          />
        ))}
        {setHighlightedLinksFirst(crossLinksDown, highLightedLinks, false)?.map(
          linkData => (
            <CrossLink
              key={`link-${linkData.source.data.d3attrs.id}-${linkData.target.data.d3attrs.id}`}
              linkData={linkData}
            />
          )
        )}
        {setHighlightedLinksFirst(crossLinksUp, highLightedLinks, true)?.map(linkData => (
          <CrossLink
            key={`link-${linkData.source.data.d3attrs.id}-${linkData.target.data.d3attrs.id}`}
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
            node={node}
            position={{ x: node.x, y: node.y }}
            parent={node.parent}
            hasChildren={!!node.children?.length}
            nodeDepth={node.depth || 1}
            setInitialDepth={handleDepthChange}
          />
        ))}
        {nodesDown?.map(node => (
          <Node
            streamType='downstream'
            rootNodeId={dataEntityId}
            key={`node-${node.x}${node.y}`}
            node={node}
            position={{ x: node.x, y: node.y }}
            parent={node.parent}
            hasChildren={!!node.children?.length}
            nodeDepth={node.depth || 1}
            setInitialDepth={handleDepthChange}
          />
        ))}
      </>
    );
  }
);

export default LineageGraph;
