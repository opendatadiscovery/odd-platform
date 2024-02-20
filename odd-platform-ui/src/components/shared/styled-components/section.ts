import styled, { css, type CSSObject } from 'styled-components';

const Section = styled('section')<{
  $flexDirection?: CSSObject['flexDirection'];
  $gap?: CSSObject['gap'];
}>(
  ({ $flexDirection = 'row', $gap = '0.5rem' }) => css`
    display: flex;
    width: 100%;
    flex-direction: ${$flexDirection};
    gap: ${$gap};
  `
);

export default Section;
