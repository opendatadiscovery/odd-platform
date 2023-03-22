import React, { useEffect, type FC, useRef, useState } from 'react';
import panzoom from 'panzoom';
import useDEGZoomParams from '../lib/hooks/useDEGZoomParams';
import DEGLineageGraph from './DEGLinegeGraph/DEGLineageGraph';
import * as S from './ZoomableDEGLineage.styles';

const ZoomableDEGLineage: FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const zoomContainerRef = useRef<HTMLDivElement>(null);

  const { maxScale, minScale, scale, moveToX, moveToY, zoomToY, zoomToX } =
    useDEGZoomParams();

  useEffect(() => {
    if (!zoomContainerRef.current) return;
    const zoom = panzoom(zoomContainerRef.current, { smoothScroll: false });

    zoom.moveTo(moveToX, moveToY);
    zoom.zoomTo(zoomToX, zoomToY, scale);
    zoom.setMaxZoom(maxScale);
    zoom.setMinZoom(minScale);

    return () => {
      zoom.dispose();
    };
  }, [
    zoomContainerRef.current,
    maxScale,
    minScale,
    scale,
    moveToX,
    moveToY,
    zoomToY,
    zoomToX,
  ]);

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
