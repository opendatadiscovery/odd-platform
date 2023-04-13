import React, { useMemo } from 'react';
import type { DefaultLinkObject } from 'd3';
import { linkHorizontal } from 'd3-shape';
import { MarkerArrow } from '@visx/marker';
import { LinePath } from '@visx/shape';
import { curveBasis } from '@visx/curve';
import { type TreeLinkDatum } from 'redux/interfaces';
import LineageContext from '../../../lineageLib/LineageContext/LineageContext';

interface CrossLinkProps {
  linkData: TreeLinkDatum;
  reverse?: boolean;
}

const CrossLink: React.FC<CrossLinkProps> = ({ linkData, reverse }) => {
  const { nodeSize } = React.useContext(LineageContext);

  const { source, target, isHighlighted } = linkData;

  const crossLinkCoords: DefaultLinkObject = {
    source: reverse
      ? [source.y + nodeSize.size.width, source.x + nodeSize.size.height / 1.5]
      : [source.y, source.x + nodeSize.size.height / 1.5],
    target: reverse
      ? [target.y, target.x + nodeSize.size.height / 1.5]
      : [target.y + nodeSize.size.width, target.x + nodeSize.size.height / 1.5],
  };

  const drawPath = () => linkHorizontal()(crossLinkCoords) || undefined;

  const headUrl = useMemo(
    () => `url(#crossHead${isHighlighted ? '-highlighted' : ''})`,
    [isHighlighted]
  );

  return (
    <>
      <MarkerArrow
        id='crossHead-highlighted'
        fill='#0080FF'
        size={6}
        orient='auto-start-reverse'
      />
      <MarkerArrow id='crossHead' fill='#A8B0BD' size={6} orient='auto-start-reverse' />
      <LinePath
        curve={curveBasis}
        d={drawPath()}
        strokeDasharray={10}
        stroke={isHighlighted ? '#66B3FF' : '#A8B0BD'}
        strokeWidth='2'
        markerStart={reverse ? headUrl : ''}
        markerEnd={reverse ? '' : headUrl}
      />
    </>
  );
};

export default CrossLink;
