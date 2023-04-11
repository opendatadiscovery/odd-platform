import React, { type FC } from 'react';
import useDEGZoom from '../lib/hooks/useDEGZoom';
import DEGLineageGraph from './DEGLinegeGraph/DEGLineageGraph';
import * as S from './ZoomableDEGLineage.styles';

const ZoomableDEGLineage: FC = () => {
  const { zoomRef, transform, isDragging, setLastPosition } = useDEGZoom();

  return (
    <S.Container $isDragging={isDragging} onMouseLeave={setLastPosition}>
      <S.ZoomWrapper ref={zoomRef}>
        <S.ZoomContainer style={{ transform }}>
          <DEGLineageGraph />
        </S.ZoomContainer>
      </S.ZoomWrapper>
    </S.Container>
  );
};

export default ZoomableDEGLineage;
