import styled from 'styled-components';

export const Container = styled('svg')<{ $isDragging: boolean }>(({ $isDragging }) => ({
  cursor: $isDragging ? 'grabbing' : 'grab',
}));
