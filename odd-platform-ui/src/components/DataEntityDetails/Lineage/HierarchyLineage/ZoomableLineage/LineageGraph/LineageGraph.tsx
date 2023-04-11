import React from 'react';
import { type DataEntityLineageById } from 'redux/interfaces';
import { useQueryParams } from 'lib/hooks';
import { setHighlightedLinksFirst } from 'components/DataEntityDetails/Lineage/HierarchyLineage/lineageLib/helpers';
import CrossLink from 'components/DataEntityDetails/Lineage/HierarchyLineage/ZoomableLineage/LineageGraph/CrossLink/CrossLink';
import type { LineageQueryParams } from 'components/DataEntityDetails/Lineage/HierarchyLineage/lineageLib/interfaces';
import Link from 'components/DataEntityDetails/Lineage/HierarchyLineage/ZoomableLineage/LineageGraph/Link/Link';
import {
  defaultGraphState,
  defaultLineageQuery,
} from 'components/DataEntityDetails/Lineage/HierarchyLineage/lineageLib/constants';
import {
  generateTree,
  parseData,
} from 'components/DataEntityDetails/Lineage/HierarchyLineage/lineageLib/generateGraph';
import LineageContext from 'components/DataEntityDetails/Lineage/HierarchyLineage/lineageLib/LineageContext/LineageContext';
import Node from 'components/DataEntityDetails/Lineage/HierarchyLineage/ZoomableLineage/LineageGraph/Node/Node';

interface LineageGraphProps {
  dataEntityId: number;
  data: DataEntityLineageById;
}

const LineageGraph = React.memo<LineageGraphProps>(({ data, dataEntityId }) => {
  const {
    nodeSize,
    setRenderedNodes,
    setRenderedLinks,
    highLightedLinks,
    renderedLinks,
    setHighLightedLinks,
  } = React.useContext(LineageContext);

  const {
    queryParams: { fn },
  } = useQueryParams<LineageQueryParams>(defaultLineageQuery);

  const separation = { siblings: 1, nonSiblings: 1 };

  const { linksUp, crossLinksUp, nodesDown, linksDown, crossLinksDown, nodesUp } =
    React.useMemo(() => {
      const parsedData = parseData(data);
      return generateTree({ parsedData, defaultGraphState, separation, nodeSize });
    }, [data, nodeSize]);

  React.useEffect(() => {
    setRenderedNodes([...nodesUp, ...nodesDown]);
  }, [fn, data]);

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
          nodeSize={nodeSize}
          renderedLinks={renderedLinks}
          setHighLightedLinks={setHighLightedLinks}
          streamType='upstream'
          rootNodeId={dataEntityId}
          key={`node-${node.x}${node.y}`}
          reverse
          node={node}
          parent={node.parent}
          hasChildren={!!node.children?.length}
        />
      ))}
      {nodesDown?.map(node => (
        <Node
          nodeSize={nodeSize}
          renderedLinks={renderedLinks}
          setHighLightedLinks={setHighLightedLinks}
          streamType='downstream'
          rootNodeId={dataEntityId}
          key={`node-${node.x}${node.y}`}
          node={node}
          parent={node.parent}
          hasChildren={!!node.children?.length}
        />
      ))}
    </>
  );
});

export default LineageGraph;
