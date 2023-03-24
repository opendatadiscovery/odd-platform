import styled from 'styled-components';

export const Container = styled('div')<{ $isDragging: boolean }>(({ $isDragging }) => ({
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  cursor: $isDragging ? 'grabbing' : 'grab',
}));

export const ZoomContainer = styled('div')(() => ({ width: '100%', height: '100%' }));
