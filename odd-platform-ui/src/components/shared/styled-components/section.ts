import styled, { css, type CSSObject } from 'styled-components';

const Section = styled('section')<{
  $flexDirection?: CSSObject['flexDirection'];
}>(
  ({ theme, $flexDirection = 'row' }) => css`
    display: flex;
    width: 100%;
    flex-direction: ${$flexDirection};
    gap: ${theme.spacing(1)};
  `
);

export default Section;
