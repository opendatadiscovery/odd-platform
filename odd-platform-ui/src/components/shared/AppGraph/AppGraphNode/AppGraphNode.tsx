import React, { SyntheticEvent } from 'react';
import { HierarchyPointNode } from 'd3-hierarchy';
import { select } from 'd3-selection';
import cx from 'classnames';
import { withStyles } from '@material-ui/core';
import { DataEntityTypeLabelMap } from 'redux/interfaces/dataentities';
import { useHistory } from 'react-router-dom';
import { dataEntityDetailsPath } from 'lib/paths';
import { TreeNodeDatum, Point } from 'redux/interfaces/graph';
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
}) => {
  const history = useHistory();
  const detailsLink =
    parent && (data.externalName || data.internalName)
      ? dataEntityDetailsPath(data.id)
      : undefined;

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

  React.useEffect(() => {
    commitTransform();
  }, []);

  const handleOnClick = (evt: SyntheticEvent) => {
    evt.preventDefault();
    evt.stopPropagation();
    if (detailsLink) history.push(detailsLink);
  };

  const handleOnMouseOver = (evt: SyntheticEvent) => {};

  const handleOnMouseOut = (evt: SyntheticEvent) => {};

  return (
    <a href={detailsLink} onClick={handleOnClick}>
      <g
        id={data.d3attrs.id}
        ref={n => {
          if (n) nodeRef = n;
        }}
        style={initialStyle}
        className={classes.container}
        transform={transform}
      >
        <rect
          rx={8}
          width={nodeSize.x}
          height={nodeSize.y}
          className={!parent ? classes.rootNodeRect : ''}
          onMouseOver={handleOnMouseOver}
          onMouseOut={handleOnMouseOut}
        />
        <g transform={`translate(${titleLayout.x},${titleLayout.y})`}>
          {data.externalName || data.internalName ? (
            <text
              className={cx(classes.title, 'wrap-text')}
              width={nodeSize.x - titleLayout.x * 2}
            >
              <title>{data.externalName || data.internalName}</title>
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
            <title>{data.namespace?.name}</title>
            <tspan
              x={attributeLayout.labelWidth}
              y={0}
              className="visible-text"
            />
            <tspan className="ellip">...</tspan>
            {!data.namespace && (
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
    </a>
  );
};

export default withStyles(styles)(AppGraphNode);
