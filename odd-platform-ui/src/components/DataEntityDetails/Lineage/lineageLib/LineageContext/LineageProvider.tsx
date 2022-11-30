import React from 'react';
import { type TreeNodeDatum } from 'redux/interfaces';
import { getMaxTitleHeight } from 'components/DataEntityDetails/Lineage/lineageLib/helpers';
import { HierarchyPointLink, type HierarchyPointNode } from 'd3-hierarchy';
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

  const nodeSize = React.useMemo(
    () => generateNodeSize(compact, titleHeight),
    [compact, titleHeight]
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
    }),
    [
      compact,
      setCompactView,
      fullTitles,
      setFullTitlesView,
      renderedLinks,
      highLightedLinks,
    ]
  );

  return (
    <LineageContext.Provider value={providerValue}>{children}</LineageContext.Provider>
  );
};

export default LineageProvider;
