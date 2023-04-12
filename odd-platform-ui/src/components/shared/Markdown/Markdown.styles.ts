import styled, { type CSSObject } from 'styled-components';

export const Container = styled('div')(
  () =>
    ({
      display: 'flex',
      width: '100%',
      position: 'relative',
    } as CSSObject)
);
