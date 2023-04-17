import styled from 'styled-components';

export const Scrollable = styled('div')(({ theme }) => ({
  height: 'calc(100vh - 270px)',
  width: '100%',
  overflowY: 'auto',
  overflowX: 'hidden',
  contain: 'strict',
  marginTop: theme.spacing(1),
}));

export const Container = styled('div')<{ $height: number }>(({ $height }) => ({
  height: `${$height}px`,
  width: '100%',
  position: 'relative',
  willChange: 'transform',
}));

export const ItemContainer = styled('div')<{ $translateY: number }>(
  ({ $translateY }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    transform: `translateY(${$translateY}px)`,
  })
);
