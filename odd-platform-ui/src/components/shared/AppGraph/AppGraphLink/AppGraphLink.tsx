import React from 'react';
import { select } from 'd3-selection';
import { linkHorizontal } from 'd3-shape';
import { DefaultLinkObject } from 'd3';
import { TreeLinkDatum } from 'redux/interfaces/graph';
import * as S from './AppGraphLinkStyles';

interface AppGraphLinkProps {
  linkData: TreeLinkDatum;
  nodeSize: {
    x: number;
    y: number;
    mx: number;
    my: number;
  };
  reverse?: boolean;
  crossLink?: boolean;
  enableLegacyTransitions: boolean;
  transitionDuration: number;
}

const AppGraphLink: React.FC<AppGraphLinkProps> = ({
  linkData,
  nodeSize,
  reverse,
  crossLink,
  enableLegacyTransitions,
  transitionDuration,
}) => {
  let linkRef: SVGPathElement;
  const { source, target } = linkData;
  const coords: DefaultLinkObject = {
    source: reverse
      ? [source.y, source.x + nodeSize.y / 2]
      : [source.y + nodeSize.x, source.x + nodeSize.y / 2],
    target: reverse
      ? [target.y + nodeSize.x, target.x + nodeSize.y / 2]
      : [target.y, target.x + nodeSize.y / 2],
  };

  const crossLinkCoords: DefaultLinkObject = {
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
    linkHorizontal()(crossLink ? crossLinkCoords : coords) || undefined;

  const setMarkerStart = (): string => (reverse ? 'url(#head)' : '');

  const setCrossMarkerStart = (): string =>
    reverse ? 'url(#crossHead)' : '';

  const setMarkerEnd = (): string => (reverse ? '' : 'url(#head)');

  const setCrossMarkerEnd = (): string =>
    reverse ? '' : 'url(#crossHead)';

  return (
    <>
      <defs>
        <marker
          id={crossLink ? 'crossHead' : 'head'}
          orient="auto-start-reverse"
          markerWidth="13"
          markerHeight="14"
          refX="11"
          refY="5.6"
        >
          <S.Arrow d="M 0 0 12 6 0 12 3 6" $crossLink={crossLink} />
        </marker>
      </defs>
      <S.Path
        ref={l => {
          if (l) linkRef = l;
        }}
        style={{ opacity: 0 }}
        d={drawPath()}
        data-source-id={source.id}
        data-target-id={target.id}
        markerEnd={crossLink ? setCrossMarkerEnd() : setMarkerEnd()}
        markerStart={crossLink ? setCrossMarkerStart() : setMarkerStart()}
        $crossLink={crossLink}
      />
    </>
  );
};

export default AppGraphLink;
