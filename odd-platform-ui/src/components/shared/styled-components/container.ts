import styled, { css, type CSSObject } from 'styled-components';

const Container = styled('div')<{
  $flexDirection?: CSSObject['flexDirection'];
}>(
  ({ theme, $flexDirection = 'row' }) => css`
    display: flex;
    flex-direction: ${$flexDirection};
    gap: ${theme.spacing(2)};
  `
);

export default Container;
