import styled, { css, type CSSObject } from 'styled-components';

export const LayoutContainer = styled('div')(
  ({ theme }) => css`
    display: flex;
    padding: ${theme.spacing(2)};
    gap: ${theme.spacing(2)};
    overflow: auto;
    height: calc(100lvh - 3rem);
  `
);

export const Sidebar = styled('aside')<{
  $alignSelf?: CSSObject['alignSelf'];
  $position?: CSSObject['position'];
}>(
  ({ theme, $position = 'relative', $alignSelf = 'auto' }) => css`
    top: ${theme.spacing(0)};
    position: ${$position};
    align-self: ${$alignSelf};
    width: 100%;
    max-width: 15rem;
    padding: ${theme.spacing(0.5)};
  `
);

export const Content = styled('main')(
  () => css`
    flex-grow: 1;
  `
);
