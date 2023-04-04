import React from 'react';
import { type TreeNodeDatum } from 'redux/interfaces';
import type { HierarchyPointLink, HierarchyPointNode } from 'd3-hierarchy';
import { useQueryParams } from 'lib/hooks';
import type { LineageQueryParams } from 'components/DataEntityDetails/Lineage/HierarchyLineage/lineageLib/interfaces';
import {
  getMaxODDRNHeight,
  getMaxTitleHeight,
} from 'components/DataEntityDetails/Lineage/HierarchyLineage/lineageLib/helpers';
import { generateNodeSize } from 'components/DataEntityDetails/Lineage/HierarchyLineage/lineageLib/generateNodeSize';
import LineageContext, {
  type LineageContextProps,
} from 'components/DataEntityDetails/Lineage/HierarchyLineage/lineageLib/LineageContext/LineageContext';
import { defaultLineageQuery } from 'components/DataEntityDetails/Lineage/HierarchyLineage/lineageLib/constants';

type LineageProviderProps = Omit<
  LineageContextProps,
  | 'nodeSize'
  | 'setRenderedNodes'
  | 'setRenderedLinks'
  | 'getHighLightedLinks'
  | 'highLightedLinks'
  | 'setHighLightedLinks'
  | 'renderedLinks'
> &
  React.PropsWithChildren;

const LineageProvider: React.FC<LineageProviderProps> = ({ children }) => {
  const {
    queryParams: { full, fn },
  } = useQueryParams<LineageQueryParams>(defaultLineageQuery);

  const [renderedNodes, setRenderedNodes] = React.useState<
    HierarchyPointNode<TreeNodeDatum>[]
  >([]);
  const [renderedLinks, setRenderedLinks] = React.useState<
    HierarchyPointLink<TreeNodeDatum>[]
  >([]);
  const [highLightedLinks, setHighLightedLinks] = React.useState<
    HierarchyPointLink<TreeNodeDatum>[]
  >([]);

  const titleHeight = React.useMemo(
    () => getMaxTitleHeight(renderedNodes, fn),
    [fn, renderedNodes]
  );

  const oddrnHeight = React.useMemo(
    () => getMaxODDRNHeight(renderedNodes),
    [renderedNodes]
  );

  const nodeSize = React.useMemo(
    () => generateNodeSize({ full, titleHeight, oddrnHeight }),
    [full, titleHeight, oddrnHeight]
  );

  const providerValue = React.useMemo<LineageContextProps>(
    () => ({
      nodeSize,
      setRenderedNodes,
      renderedLinks,
      setRenderedLinks,
      highLightedLinks,
      setHighLightedLinks,
    }),
    [full, fn, renderedLinks, highLightedLinks]
  );

  return (
    <LineageContext.Provider value={providerValue}>{children}</LineageContext.Provider>
  );
};

export default LineageProvider;
