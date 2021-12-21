import React from 'react';
import { HierarchyPointNode } from 'd3-hierarchy';
import { select } from 'd3-selection';
import { interpolateString } from 'd3-interpolate';
import cx from 'classnames';
import withStyles from '@mui/styles/withStyles';
import { DataEntityTypeLabelMap } from 'redux/interfaces/dataentities';
import { Link } from 'react-router-dom';
import { dataEntityDetailsPath } from 'lib/paths';
import { Point, TreeNodeDatum } from 'redux/interfaces/graph';
import { DataEntityLineage } from 'generated-sources';
import { styles, StylesType } from './AppGraphNodeStyles';

interface AppGraphNodeProps extends StylesType {
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
  classes,
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
    parent && data.externalName ? dataEntityDetailsPath(data.id) : '#';

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
  const typeLayout = {
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
      fetchMoreLineage(data.id, parent?.children[0].depth).then(() =>
        setShowLoadMore(false)
      );
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

  // grouped items list
  let groupedItemsListRef: SVGGElement;

  const groupedItemsListLayoutInitial = {
    x: nodeSize.x,
    y: nodeSize.y / 2,
    width: 180,
    height: 24,
    my: 12,
    mx: 8,
  };

  const [listSize, setListSize] = React.useState(
    groupedItemsListLayoutInitial
  );

  const listItemHeight = 10;
  const calculateListHeight = () =>
    data.nodesRelatedWithDEG
      ? listItemHeight * data.nodesRelatedWithDEG?.length
      : listItemHeight;

  React.useEffect(() => {
    setListSize({
      ...groupedItemsListLayoutInitial,
      height: calculateListHeight(),
    });
  }, [compactView]);

  const groupedItemsList = () => (
    <g
      ref={n => {
        if (n) groupedItemsListRef = n;
      }}
      className={classes.groupedItemsList}
    >
      <rect
        width={loadMoreLayout.width}
        height={loadMoreLayout.height}
        rx={16}
      />
      <text
        textAnchor="middle"
        fontSize={12}
        fill="#0066CC"
        x={loadMoreLayout.width / 2}
        y={loadMoreLayout.height / 2 + loadMoreLayout.my}
      >
        Load more
      </text>
    </g>
  );

  const [showList, setShowList] = React.useState<boolean>(false);

  const handleListMouseEnter = () => setShowList(true);
  const handleListMouseLeave = () => setShowList(false);

  const groupedItemsBtn = () => (
    <>
      <text
        className="wrap-text"
        width={nodeSize.x - titleLayout.x * 2 - attributeLayout.labelWidth}
        onMouseEnter={handleListMouseEnter}
        onMouseLeave={handleListMouseLeave}
      >
        <title>{`${
          data.nodesRelatedWithDEG && data.nodesRelatedWithDEG.length
        } entities`}</title>
        <tspan
          x={attributeLayout.labelWidth}
          y={attributeLayout.height * 2}
          className={cx(classes.groupedItemsBtn, 'visible-text')}
        />
        <tspan className="ellip">...</tspan>
      </text>
    </>
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
      <Link to={detailsLink}>
        <g className={classes.container}>
          <rect
            rx={8}
            width={nodeSize.x}
            height={nodeSize.y}
            className={!parent ? classes.rootNodeRect : ''}
          />
          <g transform={`translate(${titleLayout.x},${titleLayout.y})`}>
            {data.externalName ? (
              <text
                className={cx(classes.title, 'wrap-text')}
                width={nodeSize.x - titleLayout.x * 2}
              >
                <title>{data.internalName || data.externalName}</title>
                <tspan x={0} y={0} className="visible-text" />
                <tspan className="ellip">...</tspan>
              </text>
            ) : (
              <>
                <circle
                  cx="5"
                  cy="0"
                  r="5"
                  stroke="#091E42"
                  strokeWidth="2"
                />
                <rect
                  x="0"
                  y="0.81418"
                  width="2"
                  height="9.37199"
                  rx="1"
                  transform="rotate(-45 -4 -1.81418)"
                  fill="#091E42"
                />
              </>
            )}
          </g>
          <g
            transform={`translate(${titleLayout.x},${
              nodeSize.y - typeLayout.my
            })`}
          >
            <text className={classes.attribute}>
              <tspan
                x={0}
                y={0}
                className={classes.placeholder}
                style={{
                  display:
                    compactView && !data.externalName && !data.internalName
                      ? 'initial'
                      : 'none',
                }}
              >
                No Information
              </tspan>
            </text>
          </g>
          <g
            transform={`translate(${attributeLayout.x},${attributeLayout.y})`}
            style={{ display: compactView ? 'none' : 'initial' }}
          >
            <text className={classes.attribute}>
              <tspan
                className={classes.attributeLabel}
                key={`nsl-${data.id}`}
                x={0}
                y={0}
              >
                Space
              </tspan>
            </text>
            <text
              className={cx(classes.attribute, 'wrap-text')}
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
              {!data.dataSource?.namespace && (
                <tspan
                  x={attributeLayout.labelWidth}
                  y={0}
                  className={classes.placeholder}
                >
                  No Information
                </tspan>
              )}
            </text>
            <text className={classes.attribute}>
              <tspan
                className={classes.attributeLabel}
                key={`dsl-${data.id}`}
                x={0}
                y={attributeLayout.height}
              >
                Source
              </tspan>
            </text>
            <text
              className={cx(classes.attribute, 'wrap-text')}
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
              {!data.dataSource && (
                <tspan
                  x={attributeLayout.labelWidth}
                  y={attributeLayout.height}
                  className={classes.placeholder}
                >
                  No Information
                </tspan>
              )}
            </text>
            {data.nodesRelatedWithDEG &&
              data.nodesRelatedWithDEG?.length > 0 && (
                <>
                  <text className={classes.attribute}>
                    <tspan
                      className={classes.attributeLabel}
                      key={`dsl-${data.id}`}
                      x={0}
                      y={attributeLayout.height * 2}
                    >
                      Items
                    </tspan>
                  </text>
                  {groupedItemsBtn()}
                </>
              )}
          </g>
          {data.types?.map((type, i) => (
            <g
              key={type.id}
              transform={`translate(${
                titleLayout.x + i * (typeLayout.width + typeLayout.mx)
              },${nodeSize.y - typeLayout.my - typeLayout.height})`}
            >
              <rect
                className={cx(classes.type, type.name)}
                width={typeLayout.width}
                height={typeLayout.height}
                rx={4}
              />
              <text
                className={classes.typeLabel}
                textAnchor="middle"
                fontSize={12}
                x={typeLayout.width / 2}
                y={typeLayout.height / 2 + 1}
              >
                <tspan alignmentBaseline="middle">
                  {DataEntityTypeLabelMap.get(type.name)?.short}
                  <title>
                    {DataEntityTypeLabelMap.get(type.name)?.normal}
                  </title>
                </tspan>
              </text>
            </g>
          ))}
        </g>
      </Link>
      {!hasChildren && showLoadMore && (
        <g
          ref={n => {
            if (n) loadMoreRef = n;
          }}
          transform={loadMoreTransformTranslate}
          className={classes.button}
          onClick={loadMoreButtonHandler}
        >
          <rect
            width={loadMoreLayout.width}
            height={loadMoreLayout.height}
            rx={16}
          />
          {isStreamFetching ? (
            <g>
              <circle
                className={classes.loadMoreSpinnerBack}
                cx={centerX}
                cy={centerY}
                r={radius}
                strokeWidth={strokeWidth}
              />
              <circle
                className={classes.loadMoreSpinner}
                ref={n => {
                  if (n) loadMoreSpinnerRef = n;
                }}
              />
            </g>
          ) : (
            <text
              textAnchor="middle"
              fontSize={12}
              fill="#0066CC"
              x={loadMoreLayout.width / 2}
              y={loadMoreLayout.height / 2 + loadMoreLayout.my}
            >
              Load more
            </text>
          )}
        </g>
      )}
      {showList ? groupedItemsList() : null}
    </g>
  );
};

export default withStyles(styles)(AppGraphNode);
