import React from 'react';
import { type TreeNodeDatum } from 'redux/interfaces';
import { getMaxTitleHeight } from 'components/DataEntityDetails/Lineage/lineageLib/helpers';
import { type HierarchyPointNode } from 'd3-hierarchy';
import { generateNodeSize } from '../generateNodeSize';
import LineageContext, { type LineageContextProps } from './LineageContext';

type LineageProviderProps = Omit<LineageContextProps, 'nodeSize' | 'setRenderedNodes'>;

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
    }),
    [compact, setCompactView, fullTitles, setFullTitlesView]
  );

  return (
    <LineageContext.Provider value={providerValue}>{children}</LineageContext.Provider>
  );
};

export default LineageProvider;
