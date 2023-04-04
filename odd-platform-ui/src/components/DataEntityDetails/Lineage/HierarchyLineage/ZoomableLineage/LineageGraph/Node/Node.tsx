import React from 'react';
import type { HierarchyPointLink, HierarchyPointNode } from 'd3-hierarchy';
import { useNavigate } from 'react-router-dom';
import type { TreeNodeDatum } from 'redux/interfaces/graph';
import { DataEntityClassNameEnum } from 'generated-sources';
import { type StreamType } from 'redux/interfaces';
import { useAppPaths, useQueryParams } from 'lib/hooks';
import { Group } from '@visx/group';
import type { NodeSize } from '../../../lineageLib/interfaces';
import { getHighLightedLinks } from '../../../lineageLib/helpers';
import NodeTitle from './NodeTitle/NodeTitle';
import HiddenDependencies from './HiddenDependencies/HiddenDependencies';
import Info from './Info/Info';
import Classes from './Classes/Classes';
import * as S from './NodeStyles';
import LoadMoreButton from './LoadMoreButton/LoadMoreButton';
import { defaultLineageQuery } from '../../../lineageLib/constants';

interface NodeProps {
  streamType: StreamType;
  rootNodeId: number;
  node: HierarchyPointNode<TreeNodeDatum>;
  parent: HierarchyPointNode<TreeNodeDatum> | null;
  reverse?: boolean;
  hasChildren: boolean;
  nodeSize: NodeSize;
  renderedLinks: HierarchyPointLink<TreeNodeDatum>[];
  setHighLightedLinks: (links: HierarchyPointLink<TreeNodeDatum>[]) => void;
}

const Node = React.memo<NodeProps>(
  ({
    streamType,
    renderedLinks,
    setHighLightedLinks,
    nodeSize,
    rootNodeId,
    node,
    parent,
    reverse,
    hasChildren,
  }) => {
    const navigate = useNavigate();
    const { dataEntityLineagePath } = useAppPaths();
    const {
      defaultQueryString: lineageQueryString,
      queryParams: { fn, full },
    } = useQueryParams({
      ...defaultLineageQuery,
      d: node.depth || 1,
    });

    const lineageLink = React.useMemo(() => {
      const entityId = node.data.originalGroupId
        ? node.data.originalGroupId
        : node.data.id;

      return parent && node.data.externalName
        ? dataEntityLineagePath(entityId, lineageQueryString)
        : '#';
    }, [
      parent,
      node.data.originalGroupId,
      node.data.id,
      node.data.externalName,
      lineageQueryString,
    ]);

    const handleTitleClick = React.useCallback(() => {
      navigate(lineageLink);
    }, [lineageLink]);

    const [showLoadMore, setShowLoadMore] = React.useState(false);
    const [hideLoadMore, setHideLoadMore] = React.useState(false);
    const hideLoadMoreHandler = React.useCallback(() => {
      setHighLightedLinks([]);
      setHideLoadMore(true);
    }, []);

    const handleMouseEnter = React.useCallback(() => {
      setShowLoadMore(true);
      getHighLightedLinks(node, renderedLinks, streamType, setHighLightedLinks);
    }, [node, renderedLinks, streamType]);
    const handleMouseLeave = React.useCallback(() => {
      setShowLoadMore(false);
      setHighLightedLinks([]);
    }, []);

    const isDEG = React.useMemo(
      () =>
        !!node.data.entityClasses?.find(
          entityClass => entityClass.name === DataEntityClassNameEnum.ENTITY_GROUP
        ),
      [node]
    );

    const hasMoreLineage = React.useMemo(
      () =>
        streamType === 'downstream'
          ? Boolean(node.data.childrenCount)
          : Boolean(node.data.parentsCount),
      [streamType, node]
    );

    return (
      <Group
        top={node.x}
        left={node.y}
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
            nodeSize={nodeSize}
            fullNames={fn}
            externalName={node.data.externalName}
            internalName={node.data.internalName}
            handleTitleClick={handleTitleClick}
          />
          <HiddenDependencies
            nodeSize={nodeSize}
            reverse={reverse}
            childrenCount={node.data.childrenCount}
            parentsCount={node.data.parentsCount}
            externalName={node.data.externalName}
          />
          <Info
            nodeSize={nodeSize}
            fullNames={fn}
            full={full}
            id={node.data.id}
            dataSource={node.data.dataSource}
            rootNodeId={rootNodeId}
            nodesRelatedWithDEG={node.data.nodesRelatedWithDEG}
            internalName={node.data.internalName}
            externalName={node.data.externalName}
            oddrn={node.data.oddrn}
            streamType={streamType}
          />
          <Classes nodeSize={nodeSize} entityClasses={node.data.entityClasses} />
          <rect
            width={nodeSize.content.loadMore.layer.width}
            height={nodeSize.content.loadMore.layer.height}
            transform={
              reverse
                ? `translate(${-nodeSize.content.loadMore.layer.width}, ${-nodeSize
                    .content.loadMore.layer.y})`
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
              streamType === 'downstream'
                ? node.data.childrenCount
                : node.data.parentsCount
            }
          />
        )}
      </Group>
    );
  }
);

export default Node;
