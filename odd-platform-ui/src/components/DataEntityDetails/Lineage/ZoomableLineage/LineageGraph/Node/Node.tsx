import React from 'react';
import { type HierarchyPointNode } from 'd3-hierarchy';
import { useHistory } from 'react-router-dom';
import type { Point, TreeNodeDatum } from 'redux/interfaces/graph';
import { DataEntityClassNameEnum } from 'generated-sources';
import { type StreamType } from 'redux/interfaces';
import { useAppPaths } from 'lib/hooks';
import { Group } from '@visx/group';
import LineageContext from '../../../lineageLib/LineageContext/LineageContext';
import NodeTitle from './NodeTitle/NodeTitle';
import HiddenDependencies from './HiddenDependencies/HiddenDependencies';
import Info from './Info/Info';
import Classes from './Classes/Classes';
import * as S from './NodeStyles';
import LoadMoreButton from './LoadMoreButton/LoadMoreButton';

interface NodeProps {
  streamType: StreamType;
  rootNodeId: number;
  data: TreeNodeDatum;
  position: Point;
  parent: HierarchyPointNode<TreeNodeDatum> | null;
  reverse?: boolean;
  hasChildren: boolean;
  nodeDepth: number;
  setInitialDepth: (depth: number) => void;
}

const Node: React.FC<NodeProps> = ({
  streamType,
  rootNodeId,
  data,
  position,
  parent,
  reverse,
  hasChildren,
  nodeDepth,
  setInitialDepth,
}) => {
  const history = useHistory();
  const { dataEntityLineagePath } = useAppPaths();
  const { nodeSize } = React.useContext(LineageContext);

  const lineageLink =
    parent && data.externalName
      ? dataEntityLineagePath(data.originalGroupId ? data.originalGroupId : data.id)
      : '#';

  const handleTitleClick = React.useCallback(() => {
    setInitialDepth(nodeDepth);
    history.push(lineageLink);
  }, [lineageLink, nodeDepth]);

  const [showLoadMore, setShowLoadMore] = React.useState(false);
  const [hideLoadMore, setHideLoadMore] = React.useState(false);
  const hideLoadMoreHandler = React.useCallback(() => setHideLoadMore(true), []);

  const handleLoadMoreMouseEnter = () => setShowLoadMore(true);
  const handleLoadMoreMouseLeave = () => setShowLoadMore(false);

  const isDEG = !!data.entityClasses?.find(
    entityClass => entityClass.name === DataEntityClassNameEnum.ENTITY_GROUP
  );

  const hasMoreLineage =
    streamType === 'downstream'
      ? Boolean(data.childrenCount)
      : Boolean(data.parentsCount);

  return (
    <Group
      top={position.x}
      left={position.y}
      id={data.d3attrs.id}
      style={{ cursor: 'initial' }}
      onMouseEnter={handleLoadMoreMouseEnter}
      onMouseLeave={handleLoadMoreMouseLeave}
    >
      <S.NodeContainer>
        <S.RootNodeRect
          width={nodeSize.size.width}
          height={nodeSize.size.height}
          $parent={!!parent}
        />
        <NodeTitle
          externalName={data.externalName}
          internalName={data.internalName}
          handleTitleClick={handleTitleClick}
        />
        <HiddenDependencies
          reverse={reverse}
          childrenCount={data.childrenCount}
          parentsCount={data.parentsCount}
          externalName={data.externalName}
        />
        <Info
          id={data.id}
          dataSource={data.dataSource}
          rootNodeId={rootNodeId}
          nodesRelatedWithDEG={data.nodesRelatedWithDEG}
          internalName={data.internalName}
          externalName={data.externalName}
          streamType={streamType}
        />
        <Classes entityClasses={data.entityClasses} />
        <rect
          width={nodeSize.content.loadMore.layer.width}
          height={nodeSize.content.loadMore.layer.height}
          transform={
            reverse
              ? `translate(${-nodeSize.content.loadMore.layer.width}, ${-nodeSize.content
                  .loadMore.layer.y})`
              : `translate(${nodeSize.content.loadMore.layer.x}, ${nodeSize.content.loadMore.layer.y})`
          }
          fill='transparent'
        />
      </S.NodeContainer>

      {!hasChildren && !hideLoadMore && showLoadMore && hasMoreLineage && !isDEG && (
        <LoadMoreButton
          hideLoadMore={hideLoadMoreHandler}
          rootNodeId={rootNodeId}
          dataEntityId={data.id}
          streamType={streamType}
          reverse={reverse}
          loadMoreCount={
            streamType === 'downstream' ? data.childrenCount : data.parentsCount
          }
        />
      )}
    </Group>
  );
};

export default Node;
