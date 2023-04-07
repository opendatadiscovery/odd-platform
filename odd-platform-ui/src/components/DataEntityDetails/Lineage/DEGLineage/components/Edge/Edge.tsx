import type { FC } from 'react';
import React, { memo, useMemo } from 'react';
import { curveBundle, line } from 'd3-shape';
import { MarkerArrow } from '@visx/marker';
import { LinePath } from '@visx/shape';
import { Group } from '@visx/group';
import type { Edge as EdgeType } from '../../lib/interfaces';
import { getBezierPath } from './helpers';

interface Point {
  x: number;
  y: number;
}

interface EdgeProps {
  sections: EdgeType['sections'];
  isHighlighted: EdgeType['isHighlighted'];
}

const Edge: FC<EdgeProps> = ({ sections, isHighlighted }) => {
  const drawnPath = useMemo(() => {
    if (!sections?.length) {
      return null;
    }

    const { bendPoints, startPoint, endPoint } = sections[0];

    if (bendPoints) {
      const points = [startPoint, ...bendPoints, endPoint];

      const pathFn = line<Point>()
        .x(d => d.x)
        .y(d => d.y)
        .curve(curveBundle.beta(1));

      return pathFn(points);
    }

    return getBezierPath({
      sourceX: startPoint.x || 0,
      sourceY: startPoint.y || 0,
      targetX: endPoint.x || 0,
      targetY: endPoint.y || 0,
    });
  }, [sections]);

  return drawnPath ? (
    <Group>
      <MarkerArrow id='head' fill='#A8B0BD' size={6} orient='auto-start-reverse' />
      <MarkerArrow
        id='head-highlighted'
        fill='#0080FF'
        size={6}
        orient='auto-start-reverse'
      />
      <LinePath
        stroke={isHighlighted ? '#0080FF' : '#A8B0BD'}
        d={drawnPath}
        strokeWidth={2}
        pointerEvents='none'
        markerEnd={`url(#head${isHighlighted ? '-highlighted' : ''})`}
      />
    </Group>
  ) : null;
};

export default memo(Edge);
