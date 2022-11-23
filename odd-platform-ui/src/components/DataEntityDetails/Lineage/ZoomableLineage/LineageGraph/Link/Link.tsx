import React from 'react';
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
const Link: React.FC<LinkProps> = ({ linkData, reverse }) => {
  const { nodeSize } = React.useContext(LineageContext);

  const { source, target } = linkData;
  const coords: DefaultLinkObject = {
    source: reverse
      ? [source.y, source.x + nodeSize.size.height / 2]
      : [source.y + nodeSize.size.width, source.x + nodeSize.size.height / 2],
    target: reverse
      ? [target.y + nodeSize.size.width, target.x + nodeSize.size.height / 2]
      : [target.y, target.x + nodeSize.size.height / 2],
  };

  const crossLinkCoords: DefaultLinkObject = {
    source: reverse
      ? [source.y + nodeSize.size.width, source.x + nodeSize.size.height / 1.5]
      : [source.y, source.x + nodeSize.size.height / 1.5],
    target: reverse
      ? [target.y, target.x + nodeSize.size.height / 1.5]
      : [target.y + nodeSize.size.width, target.x + nodeSize.size.height / 1.5],
  };

  const drawPath = () =>
    linkHorizontal()(linkData?.crossLink ? crossLinkCoords : coords) || undefined;

  return (
    <>
      <MarkerArrow id='head' fill='#A8B0BD' size={6} />
      <MarkerArrow id='crossHead' fill='#66B3FF' size={4} />
      <LinePath
        curve={curveBasis}
        d={drawPath()}
        stroke={linkData?.crossLink ? '#66B3FF' : '#A8B0BD'}
        strokeWidth='2'
        markerEnd={linkData?.crossLink ? 'url(#crossHead)' : 'url(#head)'}
      />
    </>
  );
};

export default Link;
