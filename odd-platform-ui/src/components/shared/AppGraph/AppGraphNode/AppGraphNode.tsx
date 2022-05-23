import React from 'react';
import { HierarchyPointNode } from 'd3-hierarchy';
import { select } from 'd3-selection';
import { interpolateString } from 'd3-interpolate';
import { DataEntityClassLabelMap } from 'redux/interfaces/dataentities';
import { Link } from 'react-router-dom';
import { dataEntityDetailsPath } from 'lib/paths';
import { Point, TreeNodeDatum } from 'redux/interfaces/graph';
import {
  DataEntityClassNameEnum,
  DataEntityLineage,
} from 'generated-sources';
import GroupedEntitiesListModal from 'components/shared/AppGraph/AppGraphNode/GroupedEntitiesListModal/GroupedEntitiesListModal';
import NodeListButton from 'components/shared/AppGraph/AppGraphNode/NodeListButton/NodeListButton';
import {
  Attribute,
  AttributeLabel,
  Container,
  EntityClassContainer,
  LoadMoreButton,
  LoadMoreButtonName,
  LoadMoreSpinner,
  LoadMoreSpinnerBackground,
  Placeholder,
  RootNodeRect,
  Title,
  TypeLabel,
  UnknownEntityNameCircle,
  UnknownEntityNameCrossedLine,
} from './AppGraphNodeStyles';

interface AppGraphNodeProps {
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
  fetchMoreLineage: (
    entityId: number,
    lineageDepth: number
  ) => Promise<DataEntityLineage>;
  reverse?: boolean;
  isStreamFetching: boolean;
  hasChildren: boolean;
}

const AppGraphNode: React.FC<AppGraphNodeProps> = ({
  data,
  transitionDuration,
  position,
  parent,
  nodeSize,
  compactView,
  enableLegacyTransitions,
  fetchMoreLineage,
  reverse,
  isStreamFetching,
  hasChildren,
}) => {
  const detailsLink =
    parent && data.externalName
      ? dataEntityDetailsPath(
          data.originalGroupId ? data.originalGroupId : data.id
        )
      : '#';

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
      select(nodeRef)
        .attr('transform', curTransform)
        .style('opacity', opacity);
      done();
    }
  };

  const commitTransform = () => {
    const newTransform = setTransform(position, parent);
    applyTransform(newTransform, transitionDuration);
  };

  // load more btn
  let loadMoreRef: SVGGElement;
  const loadMoreLayout = {
    x: nodeSize.x,
    y: nodeSize.y / 2,
    width: 91,
    height: 24,
    my: 4,
    mx: 8,
  };

  const [showLoadMore, setShowLoadMore] = React.useState<boolean>(false);

  const handleLoadMoreMouseEnter = () => setShowLoadMore(true);
  const handleLoadMoreMouseLeave = () => setShowLoadMore(false);

  const loadMoreButtonHandler = () => {
    if (parent?.children) {
      fetchMoreLineage(data.id, 1).then(() => setShowLoadMore(false));
    }
  };

  const loadMoreTransformTranslate = `translate(${
    reverse
      ? -loadMoreLayout.mx - loadMoreLayout.width
      : loadMoreLayout.x + loadMoreLayout.mx
  },${loadMoreLayout.y - loadMoreLayout.height / 2})`;

  let loadMoreSpinnerRef: SVGGElement;

  // spinner parameters
  const centerX = 46;
  const centerY = 12;
  const radius = 8;
  const strokeWidth = 2;

  const loadMoreSpinnerTransform = () => {
    select(loadMoreSpinnerRef)
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', radius)
      .attr('stroke-width', strokeWidth)
      .attr('stroke-linecap', 'round')
      .attr('stroke-dasharray', 2 * Math.PI * radius)
      .attr('stroke-dashoffset', 50)
      .transition()
      .duration(2000)
      .attrTween('transform', () =>
        interpolateString(
          `translate(0, 0) rotate(0, ${centerX}, ${centerY})`,
          `translate(0, 0) rotate(360, ${centerX}, ${centerY})`
        )
      )
      .attr('stroke-dashoffset', 0)
      .on('end', loadMoreSpinnerTransform);
  };

  React.useEffect(() => {
    commitTransform();
    loadMoreSpinnerTransform();
  }, [commitTransform, loadMoreSpinnerTransform]);

  const isDEG = !!data.entityClasses?.find(
    entityClass =>
      entityClass.name === DataEntityClassNameEnum.ENTITY_GROUP
  );

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
        width={nodeSize.x + loadMoreLayout.width + loadMoreLayout.mx}
        transform={
          reverse
            ? `translate(${-loadMoreLayout.width - loadMoreLayout.mx})`
            : ''
        }
        height={nodeSize.y}
        fill="transparent"
      />

      <Container>
        <RootNodeRect
          width={nodeSize.x}
          height={nodeSize.y}
          $parent={!!parent}
        />
        <g transform={`translate(${titleLayout.x},${titleLayout.y})`}>
          {data.externalName ? (
            <Link to={detailsLink}>
              <Title
                className="wrap-text"
                width={nodeSize.x - titleLayout.x * 2}
              >
                <title>{data.internalName || data.externalName}</title>
                <tspan x={0} y={0} className="visible-text" />
                <tspan className="ellip">...</tspan>
              </Title>
            </Link>
          ) : (
            <>
              <UnknownEntityNameCircle />
              <UnknownEntityNameCrossedLine />
            </>
          )}
        </g>
        <g
          transform={`translate(${titleLayout.x},${
            nodeSize.y - entityClassLayout.my
          })`}
        >
          <Attribute>
            <Placeholder
              x={0}
              y={0}
              $show={
                compactView && !data.externalName && !data.internalName
              }
            >
              No Information
            </Placeholder>
          </Attribute>
        </g>
        <g
          transform={`translate(${attributeLayout.x},${attributeLayout.y})`}
          style={{ display: compactView ? 'none' : 'initial' }}
        >
          <Attribute>
            <AttributeLabel key={`nsl-${data.id}`} x={0} y={0}>
              Space
            </AttributeLabel>
          </Attribute>
          <Attribute
            className="wrap-text"
            width={
              nodeSize.x - titleLayout.x * 2 - attributeLayout.labelWidth
            }
          >
            <title>{data.dataSource?.namespace?.name}</title>
            <tspan
              x={attributeLayout.labelWidth}
              y={0}
              className="visible-text"
            />
            <tspan className="ellip">...</tspan>
            <Placeholder
              x={attributeLayout.labelWidth}
              y={0}
              $show={!data.dataSource?.namespace}
            >
              No Information
            </Placeholder>
          </Attribute>
          <Attribute>
            <AttributeLabel
              key={`dsl-${data.id}`}
              x={0}
              y={attributeLayout.height}
            >
              Source
            </AttributeLabel>
          </Attribute>
          <Attribute
            className="wrap-text"
            width={
              nodeSize.x - titleLayout.x * 2 - attributeLayout.labelWidth
            }
          >
            <title>{data.dataSource?.name}</title>
            <tspan
              x={attributeLayout.labelWidth}
              y={attributeLayout.height}
              className="visible-text"
            />
            <tspan className="ellip">...</tspan>
            <Placeholder
              x={attributeLayout.labelWidth}
              y={attributeLayout.height}
              $show={!data.dataSource}
            >
              No Information
            </Placeholder>
          </Attribute>
          {data.nodesRelatedWithDEG &&
            data.nodesRelatedWithDEG?.length > 0 && (
              <>
                <Attribute>
                  <AttributeLabel
                    key={`dsl-${data.id}`}
                    x={0}
                    y={attributeLayout.height * 2}
                  >
                    Items
                  </AttributeLabel>
                </Attribute>
                <GroupedEntitiesListModal
                  entities={data.nodesRelatedWithDEG}
                  dataEntityName={data.internalName || data.externalName}
                  fetchMoreLineage={fetchMoreLineage}
                  openBtnEl={
                    <NodeListButton
                      text={`${
                        data.nodesRelatedWithDEG &&
                        data.nodesRelatedWithDEG.length
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
              titleLayout.x +
              i * (entityClassLayout.width + entityClassLayout.mx)
            },${
              nodeSize.y - entityClassLayout.my - entityClassLayout.height
            })`}
          >
            <EntityClassContainer
              $entityClassName={entityClass.name}
              width={entityClassLayout.width}
              height={entityClassLayout.height}
            />
            <TypeLabel
              x={entityClassLayout.width / 2}
              y={entityClassLayout.height / 2 + 1}
            >
              <tspan alignmentBaseline="middle">
                {DataEntityClassLabelMap.get(entityClass.name)?.short}
                <title>
                  {DataEntityClassLabelMap.get(entityClass.name)?.normal}
                </title>
              </tspan>
            </TypeLabel>
          </g>
        ))}
      </Container>

      {!hasChildren && showLoadMore && !isDEG && (
        <LoadMoreButton
          ref={n => {
            if (n) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              loadMoreRef = n;
            }
          }}
          transform={loadMoreTransformTranslate}
          onClick={loadMoreButtonHandler}
        >
          <rect
            width={loadMoreLayout.width}
            height={loadMoreLayout.height}
            rx={16}
          />
          {isStreamFetching ? (
            <g>
              <LoadMoreSpinnerBackground
                cx={centerX}
                cy={centerY}
                r={radius}
                strokeWidth={strokeWidth}
              />
              <LoadMoreSpinner
                ref={n => {
                  if (n) loadMoreSpinnerRef = n;
                }}
              />
            </g>
          ) : (
            <LoadMoreButtonName
              x={loadMoreLayout.width / 2}
              y={loadMoreLayout.height / 2 + loadMoreLayout.my}
            >
              Load more
            </LoadMoreButtonName>
          )}
        </LoadMoreButton>
      )}
    </g>
  );
};

export default AppGraphNode;
