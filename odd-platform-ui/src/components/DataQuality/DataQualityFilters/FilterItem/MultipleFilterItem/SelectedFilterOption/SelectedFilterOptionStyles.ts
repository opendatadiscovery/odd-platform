import styled, { css } from 'styled-components';

export const Container = styled('div')(
  ({ theme }) => css`
    display: flex;
    background-color: ${theme.palette.backgrounds.primary};
    border-radius: 2px;
    padding: ${theme.spacing(0)} ${theme.spacing(0.5)} ${theme.spacing(0)}
      ${theme.spacing(0.5)};
    align-items: center;
    justify-content: space-between;
    &:hover {
      background-color: ${theme.palette.backgrounds.secondary};
    }
    margin-top: ${theme.spacing(0.5)};
    margin-right: ${theme.spacing(0.25)};
    margin-left: ${theme.spacing(0.25)};
  `
);
