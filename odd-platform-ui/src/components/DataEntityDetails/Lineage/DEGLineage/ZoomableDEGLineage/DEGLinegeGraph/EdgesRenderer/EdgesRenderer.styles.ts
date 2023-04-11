import styled, { type CSSObject } from 'styled-components';

export const Container = styled('svg')(
  () =>
    ({
      overflow: 'visible',
      pointerEvents: 'none',
      zIndex: 0,
      position: 'absolute',
      width: '100%',
      height: '100%',
      top: 0,
      left: 0,
    } as CSSObject)
);
