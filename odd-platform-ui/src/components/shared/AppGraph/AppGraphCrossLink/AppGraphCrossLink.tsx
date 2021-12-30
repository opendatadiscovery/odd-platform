import React from 'react';
import withStyles from '@mui/styles/withStyles';
import { select } from 'd3-selection';
import { linkHorizontal } from 'd3-shape';
import { DefaultLinkObject } from 'd3';
import { TreeLinkDatum } from 'redux/interfaces/graph';
import { styles, StylesType } from './AppGraphCrossLinkStyles';

interface AppGraphLinkProps extends StylesType {
  linkData: TreeLinkDatum;
  nodeSize: {
    x: number;
    y: number;
    mx: number;
    my: number;
  };
  reverse?: boolean;
  enableLegacyTransitions: boolean;
  transitionDuration: number;
}

const AppGraphCrossLink: React.FC<AppGraphLinkProps> = ({
  classes,
  linkData,
  nodeSize,
  reverse,
  enableLegacyTransitions,
  transitionDuration,
}) => {
  let linkRef: SVGPathElement;
  const { source, target } = linkData;
  const coords = {
    source: reverse
      ? [source.y + nodeSize.x, source.x + nodeSize.y / 1.5]
      : [source.y, source.x + nodeSize.y / 1.5],
    target: reverse
      ? [target.y, target.x + nodeSize.y / 1.5]
      : [target.y + nodeSize.x, target.x + nodeSize.y / 1.5],
  };

  const applyOpacity = (opacity: number, done = () => {}) => {
    if (enableLegacyTransitions) {
      select(linkRef)
        .transition()
        .duration(transitionDuration)
        .style('opacity', opacity)
        .on('end', done);
    } else {
      select(linkRef).style('opacity', opacity);
      done();
    }
  };

  React.useEffect(() => {
    applyOpacity(1);
  }, []);

  const drawPath = () =>
    linkHorizontal()(coords as DefaultLinkObject) || undefined;

  return (
    <>
      <defs>
        <marker
          id="crossHead"
          orient="auto"
          markerWidth="13"
          markerHeight="14"
          refX="11"
          refY="5.6"
        >
          <path d="M 0 0 12 6 0 12 3 6" className={classes.arrow} />
        </marker>
      </defs>
      <path
        ref={l => {
          if (l) linkRef = l;
        }}
        style={{ opacity: 0 }}
        className={classes.path}
        d={drawPath()}
        data-source-id={source.id}
        data-target-id={target.id}
        markerEnd="url(#crossHead)"
      />
    </>
  );
};

export default withStyles(styles)(AppGraphCrossLink);
