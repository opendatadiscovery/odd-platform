import { select } from 'd3-selection';

export const applyOpacity = (
  linkRef: SVGPathElement,
  enableLegacyTransitions: boolean,
  transitionDuration: number,
  opacity: number,
  done = () => {}
) => {
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
