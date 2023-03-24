import React, { useEffect, type FC, useRef, useState } from 'react';
import panzoom from 'panzoom';
import useDEGZoomParams from '../lib/hooks/useDEGZoomParams';
import DEGLineageGraph from './DEGLinegeGraph/DEGLineageGraph';
import * as S from './ZoomableDEGLineage.styles';

const ZoomableDEGLineage: FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const zoomContainerRef = useRef<HTMLDivElement>(null);

  const { moveToX, moveToY, initialZoom } = useDEGZoomParams();

  useEffect(() => {
    if (!zoomContainerRef.current) return;
    const zoom = panzoom(zoomContainerRef.current, {
      smoothScroll: false,
      initialZoom,
    });

    zoom.moveTo(moveToX, moveToY);

    return () => {
      zoom.dispose();
    };
  }, [zoomContainerRef.current, moveToX, moveToY, initialZoom]);

  return (
    <S.Container
      $isDragging={isDragging}
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
    >
      <S.ZoomContainer ref={zoomContainerRef}>
        <DEGLineageGraph />
      </S.ZoomContainer>
    </S.Container>
  );
};

export default ZoomableDEGLineage;
