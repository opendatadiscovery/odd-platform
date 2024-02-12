import styled, { css } from 'styled-components';

export const Container = styled('div')(
  ({ theme }) => css`
    padding: ${theme.spacing(2)} ${theme.spacing(1)} ${theme.spacing(1.5)}
      ${theme.spacing(1)};
  `
);

export const FacetsLoaderContainer = styled('div')(
  ({ theme }) => css`
    display: flex;
    justify-content: center;
    padding: ${theme.spacing(0)} ${theme.spacing(3)};
  `
);

export const ListContainer = styled('div')(
  ({ theme }) => css`
    margin: ${theme.spacing(2)} ${theme.spacing(0)};
  `
);
