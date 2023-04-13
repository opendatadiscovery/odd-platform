import styled, { type CSSObject } from 'styled-components';

export const Container = styled('div')<{ $isDragging: boolean }>(({ $isDragging }) => ({
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  position: 'relative',
  cursor: $isDragging ? 'grabbing' : 'grab',
}));

export const ZoomWrapper = styled('div')(
  () =>
    ({
      width: '100%',
      height: '100%',
      position: 'absolute',
      top: 0,
      left: 0,
    } as CSSObject)
);

export const ZoomContainer = styled('div')(
  () =>
    ({
      width: '100%',
      height: '100%',
      position: 'absolute',
      top: 0,
      left: 0,
      transformOrigin: '0 0',
    } as CSSObject)
);
