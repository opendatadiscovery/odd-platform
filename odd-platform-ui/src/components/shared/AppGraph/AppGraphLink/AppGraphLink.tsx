import React from 'react';
import { linkHorizontal } from 'd3-shape';
import { DefaultLinkObject } from 'd3';
import { TreeLinkDatum } from 'redux/interfaces/graph';
import { applyOpacity } from 'components/shared/AppGraph/helpers/lineageHelpers';
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
  enableLegacyTransitions: boolean;
  transitionDuration: number;
}

const AppGraphLink: React.FC<AppGraphLinkProps> = ({
  linkData,
  nodeSize,
  reverse,
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

  React.useEffect(() => {
    applyOpacity(linkRef, enableLegacyTransitions, transitionDuration, 1);
  }, []);

  const drawPath = () => linkHorizontal()(coords) || undefined;

  return (
    <>
      <defs>
        <marker
          id='head'
          orient='auto-start-reverse'
          markerWidth='13'
          markerHeight='14'
          refX='11'
          refY='5.6'
        >
          <S.Arrow d='M 0 0 12 6 0 12 3 6' />
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
        markerStart={reverse ? 'url(#head)' : ''}
        markerEnd={reverse ? '' : 'url(#head)'}
      />
    </>
  );
};

export default AppGraphLink;
