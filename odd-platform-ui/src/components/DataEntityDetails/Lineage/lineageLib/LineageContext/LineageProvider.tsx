import React from 'react';
import { type TreeNodeDatum } from 'redux/interfaces';
import { HierarchyPointLink, type HierarchyPointNode } from 'd3-hierarchy';
import { useQueryParams } from 'lib/hooks';
import type { LineageQueryParams } from '../interfaces';
import { getMaxODDRNHeight, getMaxTitleHeight } from '../helpers';
import { generateNodeSize } from '../generateNodeSize';
import LineageContext, { type LineageContextProps } from './LineageContext';
import { defaultLineageQuery } from '../constants';

type LineageProviderProps = Omit<
  LineageContextProps,
  | 'nodeSize'
  | 'setRenderedNodes'
  | 'setRenderedLinks'
  | 'getHighLightedLinks'
  | 'highLightedLinks'
  | 'setHighLightedLinks'
  | 'renderedLinks'
>;

const LineageProvider: React.FC<LineageProviderProps> = ({
  children,
  setFullTitlesView,
  fullTitles,
  expandGroups,
  setExpandGroups,
}) => {
  const {
    queryParams: { full },
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
    () => getMaxTitleHeight(renderedNodes, fullTitles),
    [fullTitles]
  );

  const oddrnHeight = React.useMemo(
    () => getMaxODDRNHeight(renderedNodes),
    [renderedNodes]
  );

  const nodeSize = React.useMemo(
    () => generateNodeSize({ full: !!full, titleHeight, oddrnHeight }),
    [full, titleHeight, oddrnHeight]
  );

  const providerValue = React.useMemo<LineageContextProps>(
    () => ({
      nodeSize,
      fullTitles,
      setFullTitlesView,
      setRenderedNodes,
      renderedLinks,
      setRenderedLinks,
      highLightedLinks,
      setHighLightedLinks,
      expandGroups,
      setExpandGroups,
    }),
    [full, fullTitles, setFullTitlesView, renderedLinks, highLightedLinks, expandGroups]
  );

  return (
    <LineageContext.Provider value={providerValue}>{children}</LineageContext.Provider>
  );
};

export default LineageProvider;
