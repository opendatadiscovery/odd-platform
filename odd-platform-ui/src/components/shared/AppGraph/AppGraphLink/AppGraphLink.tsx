import React, { SyntheticEvent } from 'react';
import { withStyles } from '@material-ui/core';
import { select } from 'd3-selection';
import { linkHorizontal } from 'd3-shape';
import { DefaultLinkObject } from 'd3';
import { TreeLinkDatum } from 'redux/interfaces/graph';
import { styles, StylesType } from './AppGraphLinkStyles';

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

const AppGraphLink: React.FC<AppGraphLinkProps> = ({
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
      ? [source.y, source.x + nodeSize.y / 2]
      : [source.y + nodeSize.x, source.x + nodeSize.y / 2],
    target: reverse
      ? [target.y + nodeSize.x, target.x + nodeSize.y / 2]
      : [target.y, target.x + nodeSize.y / 2],
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
    // if (reverse)
    //   return linkHorizontal()({
    //     source: [source.y, source.x + nodeSize.y / 2],
    //     target: [target.y + nodeSize.x, target.x + nodeSize.y / 2],
    //   });

    // return linkHorizontal()({
    //   source: [source.y + nodeSize.x, source.x + nodeSize.y / 2],
    //   target: [target.y, target.x + nodeSize.y / 2],
    // });
    linkHorizontal()(coords as DefaultLinkObject) || undefined;
  // };

  const handleOnClick = (evt: SyntheticEvent) => {};

  const handleOnMouseOver = (evt: SyntheticEvent) => {};

  const handleOnMouseOut = (evt: SyntheticEvent) => {};

  return (
    <>
      <path
        ref={l => {
          if (l) linkRef = l;
        }}
        style={{ opacity: 0 }}
        className={classes.path}
        d={drawPath()}
        onClick={handleOnClick}
        onMouseOver={handleOnMouseOver}
        onMouseOut={handleOnMouseOut}
        data-source-id={source.id}
        data-target-id={target.id}
      />
      <circle
        className={classes.circle}
        r="4"
        cx={coords.target[0]}
        cy={coords.target[1]}
      />
    </>
  );
};

export default withStyles(styles)(AppGraphLink);
