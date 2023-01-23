import styled, { type CSSObject } from 'styled-components';

export const Scrollable = styled('div')(
  () =>
    ({
      height: 'calc(100vh - 251px)',
      width: '100%',
      overflowY: 'auto',
      contain: 'strict',
    } as CSSObject)
);

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
