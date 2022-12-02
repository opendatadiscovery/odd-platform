import React from 'react';
import { type TreeNodeDatum } from 'redux/interfaces';
import { HierarchyPointLink, type HierarchyPointNode } from 'd3-hierarchy';
import { getMaxODDRNHeight, getMaxTitleHeight } from '../helpers';
import { generateNodeSize } from '../generateNodeSize';
import LineageContext, { type LineageContextProps } from './LineageContext';

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
  compact,
  children,
  setCompactView,
  setFullTitlesView,
  fullTitles,
  expandGroups,
  setExpandGroups,
}) => {
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
    () => generateNodeSize({ compact, titleHeight, oddrnHeight }),
    [compact, titleHeight, oddrnHeight]
  );

  const providerValue = React.useMemo<LineageContextProps>(
    () => ({
      compact,
      nodeSize,
      setCompactView,
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
    [
      compact,
      setCompactView,
      fullTitles,
      setFullTitlesView,
      renderedLinks,
      highLightedLinks,
      expandGroups,
    ]
  );

  return (
    <LineageContext.Provider value={providerValue}>{children}</LineageContext.Provider>
  );
};

export default LineageProvider;
