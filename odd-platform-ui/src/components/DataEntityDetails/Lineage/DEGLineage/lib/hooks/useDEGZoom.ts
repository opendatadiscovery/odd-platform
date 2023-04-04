import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryParams } from 'lib/hooks';
import { useAtom } from 'jotai';
import { zoom as D3Zoom, zoomIdentity } from 'd3-zoom';
import { select } from 'd3-selection';
import type { DEGLineageQueryParams } from '../interfaces';
import {
  defaultDEGLineageQuery,
  LAYER_HEIGHT,
  LAYER_WIDTH,
  MAX_ZOOM,
  MIN_ZOOM,
} from '../constants';
import { graphHeightAtom, graphWidthAtom, isFitClickedAtom } from '../atoms';

export default function useDEGZoom() {
  const zoomRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const {
    queryParams: { x, y, s },
    setQueryParams,
  } = useQueryParams<DEGLineageQueryParams>(defaultDEGLineageQuery);

  const [graphHeight] = useAtom(graphHeightAtom);
  const [graphWidth] = useAtom(graphWidthAtom);
  const [isFitClicked] = useAtom(isFitClickedAtom);

  const [transformX, setTransformX] = useState(0);
  const [transformY, setTransformY] = useState(0);
  const [transformScale, setTransformScale] = useState(1);

  const transform = useMemo(
    () => `translate(${transformX}px, ${transformY}px) scale(${transformScale})`,
    [transformX, transformY, transformScale]
  );

  const { centerX, centerY, scale } = useMemo(() => {
    const heightZoom = LAYER_HEIGHT / graphHeight;
    const widthZoom = LAYER_WIDTH / graphWidth;
    let compScale = Math.min(heightZoom, widthZoom);

    if (x && y && s) {
      return { centerX: x, centerY: y, scale: s };
    }

    if (
      LAYER_HEIGHT > graphHeight &&
      LAYER_WIDTH <= graphWidth &&
      graphWidth > graphHeight
    ) {
      compScale = (LAYER_WIDTH * 0.9) / graphWidth;
    }

    if (
      LAYER_HEIGHT > graphHeight &&
      LAYER_WIDTH > graphWidth &&
      graphWidth > graphHeight
    ) {
      compScale = (LAYER_WIDTH * 0.7) / graphWidth;
    }

    if (
      LAYER_HEIGHT > graphHeight &&
      LAYER_WIDTH > graphWidth &&
      graphWidth < graphHeight
    ) {
      compScale = (LAYER_HEIGHT * 0.7) / graphHeight;
    }

    const cX = (LAYER_WIDTH - graphWidth * compScale) / 2;
    const cY = (LAYER_HEIGHT - graphHeight * compScale) / 2;

    return { centerX: cX, centerY: cY, scale: compScale };
  }, [graphHeight, graphWidth, LAYER_HEIGHT, LAYER_WIDTH, x, y, s]);

  useEffect(() => {
    if (zoomRef.current) {
      const d3ZoomInstance = D3Zoom<HTMLDivElement, unknown>()
        .scaleExtent([MIN_ZOOM, MAX_ZOOM])
        .on('zoom', event => {
          const { x: X, y: Y, k: K } = event.transform;
          setTransformX(X);
          setTransformY(Y);
          setTransformScale(K);
        })
        .on('start', () => {
          setIsDragging(true);
        })
        .on('end', () => {
          setIsDragging(false);
        });

      const container = select(zoomRef.current);

      container.call(d3ZoomInstance);
      container.call(
        d3ZoomInstance.transform,
        zoomIdentity.translate(centerX, centerY).scale(scale)
      );
    }
  }, [isFitClicked]);

  const setLastPosition = useCallback(() => {
    setQueryParams(prev => ({
      ...prev,
      x: Number(transformX.toFixed(4)),
      y: Number(transformY.toFixed(4)),
      s: Number(transformScale.toFixed(4)),
    }));
  }, [transformY, transformScale, transformX, setQueryParams]);

  return useMemo(
    () => ({ zoomRef, transform, isDragging, setLastPosition }),
    [zoomRef, transform, isDragging, setLastPosition]
  );
}
