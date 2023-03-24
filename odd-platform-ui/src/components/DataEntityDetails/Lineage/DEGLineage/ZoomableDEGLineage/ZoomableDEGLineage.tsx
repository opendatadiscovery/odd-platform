import React, { useEffect, type FC, useRef, useState, useCallback, useMemo } from 'react';
import panzoom from 'panzoom';
import { useAtom } from 'jotai';
import { useQueryParams } from 'lib/hooks';
import { isFitClickedAtom } from '../lib/atoms';
import type { DEGLineageQueryParams } from '../lib/interfaces';
import { defaultDEGLineageQuery } from '../lib/constants';
import useDEGZoomParams from '../lib/hooks/useDEGZoomParams';
import DEGLineageGraph from './DEGLinegeGraph/DEGLineageGraph';
import * as S from './ZoomableDEGLineage.styles';

const ZoomableDEGLineage: FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const zoomRef = useRef<HTMLDivElement>(null);

  const {
    queryParams: { x, y, s },
    setQueryParams,
  } = useQueryParams<DEGLineageQueryParams>(defaultDEGLineageQuery);

  const [isFitClicked] = useAtom(isFitClickedAtom);

  const { moveToX, moveToY, initialZoom } = useDEGZoomParams();

  const createZoom = useCallback(
    (el: HTMLDivElement | null) => {
      if (!el) return;

      const zoom = panzoom(el, {
        smoothScroll: false,
        initialZoom: s || initialZoom,
        initialX: x || moveToX,
        initialY: y || moveToY,
      });
      return zoom;
    },
    [initialZoom, moveToY, moveToX, x, y, s]
  );
  const zoom = useMemo(() => createZoom(zoomRef.current), [zoomRef.current]);

  useEffect(() => {
    zoom?.moveTo(moveToX, moveToY);

    return () => {
      zoom?.dispose();
    };
  }, [isFitClicked, moveToY, moveToX]);

  const handleMouseUp = useCallback(() => {
    setQueryParams(prev => ({
      ...prev,
      x: Number(zoom?.getTransform().x.toFixed(2) || 0),
      y: Number(zoom?.getTransform().y.toFixed(2) || 0),
      s: Number(zoom?.getTransform().scale.toFixed(2) || 0),
    }));
  }, [setQueryParams, zoom?.getTransform]);

  return (
    <S.Container
      $isDragging={isDragging}
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={handleMouseUp}
    >
      <S.ZoomContainer ref={zoomRef}>
        <DEGLineageGraph />
      </S.ZoomContainer>
    </S.Container>
  );
};

export default ZoomableDEGLineage;
