import React from 'react';
import { HierarchyPointNode } from 'd3-hierarchy';
import { select } from 'd3-selection';
import { DataEntityClassLabelMap } from 'redux/interfaces/dataentities';
import { useHistory } from 'react-router-dom';
import { Point, TreeNodeDatum } from 'redux/interfaces/graph';
import { DataEntityClassNameEnum } from 'generated-sources';
import { StreamType } from 'redux/interfaces';
import { useAppPaths } from 'lib/hooks';
import NodeListButton from './NodeListButton/NodeListButton';
import GroupedEntitiesListModal from './GroupedEntitiesListModal/GroupedEntitiesListModal';
import * as S from './AppGraphNodeStyles';
import LoadMoreButton from './LoadMoreButton/LoadMoreButton';

interface AppGraphNodeProps {
  appGraphNodeType: StreamType;
  rootNodeId: number;
  data: TreeNodeDatum;
  position: Point;
  parent: HierarchyPointNode<TreeNodeDatum> | null;
  nodeSize: {
    x: number;
    y: number;
    mx: number;
    my: number;
  };
  compactView: boolean;
  enableLegacyTransitions: boolean;
  transitionDuration: number;
  reverse?: boolean;
  hasChildren: boolean;
  nodeDepth: number;
  setInitialDepth: (depth: number) => void;
}

const AppGraphNode: React.FC<AppGraphNodeProps> = ({
  appGraphNodeType,
  rootNodeId,
  data,
  transitionDuration,
  position,
  parent,
  nodeSize,
  compactView,
  enableLegacyTransitions,
  reverse,
  hasChildren,
  nodeDepth,
  setInitialDepth,
}) => {
  const history = useHistory();
  const { dataEntityDetailsPath } = useAppPaths();

  const detailsLink =
    parent && data.externalName
      ? dataEntityDetailsPath(data.originalGroupId ? data.originalGroupId : data.id)
      : '#';

  const handleNodeClick = () => {
    setInitialDepth(nodeDepth);
    history.push(detailsLink);
  };

  let nodeRef: SVGGElement;
  const titleLayout = {
    textAnchor: 'start',
    x: compactView ? 12 : 16,
    y: 23,
    my: 16,
    height: 20,
  };
  const attributeLayout = {
    x: titleLayout.x,
    y: titleLayout.y + titleLayout.height + titleLayout.my,
    labelWidth: 50,
    height: 20,
    my: 16,
  };
  const entityClassLayout = {
    width: 24,
    height: 16,
    my: compactView ? 11 : 16,
    mx: 2,
  };
  const loadMoreLayout = {
    x: nodeSize.x,
    y: nodeSize.y / 2,
    width: 91,
    height: 24,
    my: 4,
    mx: 16,
  };

  const setTransform = (
    currPosition: AppGraphNodeProps['position'],
    curParent: AppGraphNodeProps['parent'],
    shouldTranslateToOrigin = false
  ) => {
    if (shouldTranslateToOrigin) {
      const hasParent = curParent !== null && curParent !== undefined;
      const originX = hasParent ? curParent?.x : 0;
      const originY = hasParent ? curParent?.y : 0;
      return `translate(${originY},${originX})`;
    }
    return `translate(${currPosition.y},${currPosition.x})`;
  };

  const transform = setTransform(position, parent, true);

  const initialStyle = {
    opacity: 0,
  };

  const applyTransform = (
    curTransform: string,
    curTransitionDuration: AppGraphNodeProps['transitionDuration'],
    opacity = 1,
    done = () => {}
  ) => {
    if (enableLegacyTransitions) {
      select(nodeRef)
        .transition()
        .duration(curTransitionDuration)
        .attr('transform', curTransform)
        .style('opacity', opacity)
        .on('end', done);
    } else {
      select(nodeRef).attr('transform', curTransform).style('opacity', opacity);
      done();
    }
  };

  const upstreamArrow = (
    <svg
      width='6'
      height='6'
      viewBox='0 0 6 6'
      x={0}
      y={-attributeLayout.y + attributeLayout.my + titleLayout.my}
    >
      <path
        d='M5.2 1L1 1M1 1L1 5.2M1 1L7 7'
        stroke='#A8B0BD'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );

  const downstreamArrow = (
    <svg
      width='6'
      height='6'
      viewBox='0 0 8 8'
      x={0}
      y={-attributeLayout.y + attributeLayout.my + titleLayout.my}
    >
      <path
        d='M2.8 7L7 7M7 7L7 2.8M7 7L1 0.999999'
        stroke='#A8B0BD'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );

  const commitTransform = () => {
    const newTransform = setTransform(position, parent);
    applyTransform(newTransform, transitionDuration);
  };

  React.useEffect(() => {
    commitTransform();
  }, [commitTransform]);

  const [showLoadMore, setShowLoadMore] = React.useState<boolean>(false);
  const [hideLoadMore, setHideLoadMore] = React.useState<boolean>(false);
  const hideLoadMoreHandler = React.useCallback(
    () => setHideLoadMore(true),
    [setHideLoadMore]
  );

  const handleLoadMoreMouseEnter = () => setShowLoadMore(true);
  const handleLoadMoreMouseLeave = () => setShowLoadMore(false);

  const isDEG = !!data.entityClasses?.find(
    entityClass => entityClass.name === DataEntityClassNameEnum.ENTITY_GROUP
  );

  const hasMoreLineage =
    appGraphNodeType === 'downstream'
      ? Boolean(data.childrenCount)
      : Boolean(data.parentsCount);

  const showParentChildrenCount = reverse
    ? Boolean(data.childrenCount)
    : Boolean(data.parentsCount);

  return (
    <g
      id={data.d3attrs.id}
      ref={n => {
        if (n) nodeRef = n;
      }}
      style={initialStyle}
      transform={transform}
      onMouseEnter={handleLoadMoreMouseEnter}
      onMouseLeave={handleLoadMoreMouseLeave}
    >
      <rect
        width={loadMoreLayout.x + loadMoreLayout.mx + loadMoreLayout.width}
        transform={
          reverse
            ? `translate(${-loadMoreLayout.mx - loadMoreLayout.width}, ${
                nodeSize.y / 2 - loadMoreLayout.height
              })`
            : ``
        }
        height={loadMoreLayout.height * 2}
        fill='transparent'
      />

      <S.NodeContainer>
        <S.RootNodeRect width={nodeSize.x} height={nodeSize.y} $parent={!!parent} />
        <g transform={`translate(${titleLayout.x},${titleLayout.y})`}>
          {data.externalName ? (
            <S.Title
              className='wrap-text'
              width={nodeSize.x - titleLayout.x * 2}
              onClick={handleNodeClick}
            >
              <title>{data.internalName || data.externalName}</title>
              <tspan x={0} y={0} className='visible-text' />
              <tspan className='ellip'>...</tspan>
            </S.Title>
          ) : (
            <>
              <S.UnknownEntityNameCircle />
              <S.UnknownEntityNameCrossedLine />
            </>
          )}
        </g>
        <g transform={`translate(${titleLayout.x},${nodeSize.y - entityClassLayout.my})`}>
          <S.Attribute>
            <S.Placeholder
              x={0}
              y={0}
              $show={compactView && !data.externalName && !data.internalName}
            >
              No Information
            </S.Placeholder>
          </S.Attribute>
        </g>
        <g
          transform={`translate(${attributeLayout.x},${attributeLayout.y})`}
          style={{ display: compactView ? 'none' : 'initial' }}
        >
          {showParentChildrenCount && data.externalName ? (
            <>
              {reverse ? downstreamArrow : upstreamArrow}
              <S.Count x={10} y={-attributeLayout.height}>
                {reverse ? `${data.childrenCount}` : `${data.parentsCount}`}
              </S.Count>
            </>
          ) : null}
          <S.Attribute>
            <S.AttributeLabel key={`nsl-${data.id}`} x={0} y={0}>
              Space
            </S.AttributeLabel>
          </S.Attribute>
          <S.Attribute
            className='wrap-text'
            width={nodeSize.x - titleLayout.x * 2 - attributeLayout.labelWidth}
          >
            <title>{data.dataSource?.namespace?.name}</title>
            <tspan x={attributeLayout.labelWidth} y={0} className='visible-text' />
            <tspan className='ellip'>...</tspan>
            <S.Placeholder
              x={attributeLayout.labelWidth}
              y={0}
              $show={!data.dataSource?.namespace}
            >
              No Information
            </S.Placeholder>
          </S.Attribute>
          <S.Attribute>
            <S.AttributeLabel key={`dsl-${data.id}`} x={0} y={attributeLayout.height}>
              Source
            </S.AttributeLabel>
          </S.Attribute>
          <S.Attribute
            className='wrap-text'
            width={nodeSize.x - titleLayout.x * 2 - attributeLayout.labelWidth}
          >
            <title>{data.dataSource?.name}</title>
            <tspan
              x={attributeLayout.labelWidth}
              y={attributeLayout.height}
              className='visible-text'
            />
            <tspan className='ellip'>...</tspan>
            <S.Placeholder
              x={attributeLayout.labelWidth}
              y={attributeLayout.height}
              $show={!data.dataSource}
            >
              No Information
            </S.Placeholder>
          </S.Attribute>
          {data.nodesRelatedWithDEG && data.nodesRelatedWithDEG?.length > 0 && (
            <>
              <S.Attribute>
                <S.AttributeLabel
                  key={`dsl-${data.id}`}
                  x={0}
                  y={attributeLayout.height * 2}
                >
                  Items
                </S.AttributeLabel>
              </S.Attribute>
              <GroupedEntitiesListModal
                entities={data.nodesRelatedWithDEG}
                dataEntityName={data.internalName || data.externalName}
                appGraphNodeType={appGraphNodeType}
                rootNodeId={rootNodeId}
                openBtnEl={
                  <NodeListButton
                    text={`${
                      data.nodesRelatedWithDEG && data.nodesRelatedWithDEG.length
                    } entities`}
                  />
                }
              />
            </>
          )}
        </g>
        {data.entityClasses?.map((entityClass, i) => (
          <g
            key={entityClass.id}
            transform={`translate(${
              titleLayout.x + i * (entityClassLayout.width + entityClassLayout.mx)
            },${nodeSize.y - entityClassLayout.my - entityClassLayout.height})`}
          >
            <S.EntityClassContainer
              $entityClassName={entityClass.name}
              width={entityClassLayout.width}
              height={entityClassLayout.height}
            />
            <S.TypeLabel
              x={entityClassLayout.width / 2}
              y={entityClassLayout.height / 2 + 1}
            >
              <tspan alignmentBaseline='middle'>
                {DataEntityClassLabelMap.get(entityClass.name)?.short}
                <title>{DataEntityClassLabelMap.get(entityClass.name)?.normal}</title>
              </tspan>
            </S.TypeLabel>
          </g>
        ))}
      </S.NodeContainer>

      {!hasChildren && !hideLoadMore && showLoadMore && hasMoreLineage && !isDEG && (
        <LoadMoreButton
          hideLoadMore={hideLoadMoreHandler}
          rootNodeId={rootNodeId}
          dataEntityId={data.id}
          loadMoreLayout={loadMoreLayout}
          appGraphNodeType={appGraphNodeType}
          reverse={reverse}
          loadMoreCount={
            appGraphNodeType === 'downstream' ? data.childrenCount : data.parentsCount
          }
        />
      )}
    </g>
  );
};

export default AppGraphNode;
