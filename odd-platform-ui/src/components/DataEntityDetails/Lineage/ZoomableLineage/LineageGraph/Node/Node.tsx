import React from 'react';
import { type HierarchyPointNode } from 'd3-hierarchy';
import { useHistory } from 'react-router-dom';
import type { Point, TreeNodeDatum } from 'redux/interfaces/graph';
import { DataEntityClassNameEnum } from 'generated-sources';
import { type StreamType } from 'redux/interfaces';
import { useAppPaths, useAppQuery } from 'lib/hooks';
import { Group } from '@visx/group';
import { defaultLineageQuery } from '../../../lineageLib/constants';
import { getHighLightedLinks } from '../../../lineageLib/helpers';
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
  node: HierarchyPointNode<TreeNodeDatum>;
  position: Point;
  parent: HierarchyPointNode<TreeNodeDatum> | null;
  reverse?: boolean;
  hasChildren: boolean;
}

const Node: React.FC<NodeProps> = ({
  streamType,
  rootNodeId,
  node,
  position,
  parent,
  reverse,
  hasChildren,
}) => {
  const history = useHistory();
  const { dataEntityLineagePath } = useAppPaths();
  const { query: lineageQueryParams } = useAppQuery({
    ...defaultLineageQuery,
    d: node.depth,
  });
  const { nodeSize, renderedLinks, setHighLightedLinks } =
    React.useContext(LineageContext);

  const lineageLink =
    parent && node.data.externalName
      ? dataEntityLineagePath(
          node.data.originalGroupId ? node.data.originalGroupId : node.data.id,
          lineageQueryParams
        )
      : '#';

  const handleTitleClick = React.useCallback(() => {
    history.push(lineageLink);
  }, [lineageLink]);

  const [showLoadMore, setShowLoadMore] = React.useState(false);
  const [hideLoadMore] = React.useState(false);
  const hideLoadMoreHandler = React.useCallback(() => {
    setHighLightedLinks([]);
  }, []);

  const handleMouseEnter = () => {
    setShowLoadMore(true);
    getHighLightedLinks(node, renderedLinks, streamType, setHighLightedLinks);
  };
  const handleMouseLeave = () => {
    setShowLoadMore(false);
    setHighLightedLinks([]);
  };

  const isDEG = !!node.data.entityClasses?.find(
    entityClass => entityClass.name === DataEntityClassNameEnum.ENTITY_GROUP
  );

  const hasMoreLineage =
    streamType === 'downstream'
      ? Boolean(node.data.childrenCount)
      : Boolean(node.data.parentsCount);

  return (
    <Group
      top={position.x}
      left={position.y}
      id={node.data.d3attrs.id}
      style={{ cursor: 'initial' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <S.NodeContainer>
        <S.RootNodeRect
          width={nodeSize.size.width}
          height={nodeSize.size.height}
          $parent={!!parent}
        />
        <NodeTitle
          externalName={node.data.externalName}
          internalName={node.data.internalName}
          handleTitleClick={handleTitleClick}
        />
        <HiddenDependencies
          reverse={reverse}
          childrenCount={node.data.childrenCount}
          parentsCount={node.data.parentsCount}
          externalName={node.data.externalName}
        />
        <Info
          id={node.data.id}
          dataSource={node.data.dataSource}
          rootNodeId={rootNodeId}
          nodesRelatedWithDEG={node.data.nodesRelatedWithDEG}
          internalName={node.data.internalName}
          externalName={node.data.externalName}
          oddrn={node.data.oddrn}
          streamType={streamType}
        />
        <Classes entityClasses={node.data.entityClasses} />
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
          dataEntityId={node.data.id}
          streamType={streamType}
          reverse={reverse}
          loadMoreCount={
            streamType === 'downstream' ? node.data.childrenCount : node.data.parentsCount
          }
        />
      )}
    </Group>
  );
};

export default Node;
