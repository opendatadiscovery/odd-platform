import React, { useMemo } from 'react';
import { type TreeLinkDatum } from 'redux/interfaces';
import { linkHorizontal } from 'd3-shape';
import { MarkerArrow } from '@visx/marker';
import { curveBasis } from '@visx/curve';
import { LinePath } from '@visx/shape';
import type { DefaultLinkObject } from 'd3';
import LineageContext from '../../../lineageLib/LineageContext/LineageContext';

interface LinkProps {
  linkData: TreeLinkDatum;
  reverse?: boolean;
}
const Link = React.memo<LinkProps>(({ linkData, reverse }) => {
  const { nodeSize } = React.useContext(LineageContext);

  const { source, target, isHighlighted } = linkData;

  const coords: DefaultLinkObject = {
    source: reverse
      ? [source.y, source.x + nodeSize.size.height / 2]
      : [source.y + nodeSize.size.width, source.x + nodeSize.size.height / 2],
    target: reverse
      ? [target.y + nodeSize.size.width, target.x + nodeSize.size.height / 2]
      : [target.y, target.x + nodeSize.size.height / 2],
  };

  const drawPath = () => linkHorizontal()(coords) || undefined;

  const headUrl = useMemo(
    () => `url(#head${isHighlighted ? '-highlighted' : ''})`,
    [isHighlighted]
  );

  return (
    <>
      <MarkerArrow id='head' fill='#A8B0BD' size={6} orient='auto-start-reverse' />
      <MarkerArrow
        id='head-highlighted'
        fill='#0080FF'
        size={6}
        orient='auto-start-reverse'
      />
      <LinePath
        curve={curveBasis}
        d={drawPath()}
        stroke={isHighlighted ? '#0080FF' : '#A8B0BD'}
        strokeWidth='2'
        markerStart={reverse ? headUrl : ''}
        markerEnd={reverse ? '' : headUrl}
      />
    </>
  );
});

export default Link;
