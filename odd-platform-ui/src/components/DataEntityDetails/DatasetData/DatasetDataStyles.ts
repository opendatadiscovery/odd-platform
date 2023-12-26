import styled, { css } from 'styled-components';
import { Box } from '@mui/material';

export const Header = styled(Box)(
  ({ theme }) => css`
    position: sticky;
    top: 0;
    display: flex;
    align-items: center;
    padding: ${theme.spacing(0, 0.25, 0, 0)};
  `
);

export const HeaderCell = styled(Box)(
  ({ theme }) => css`
  display: flex;
  align-items: center;
  height: 100%;
  padding: ${theme.spacing(0, 1)};
  border-bottom: 1px solid ${theme.palette.border.primary};
  overflow: hidden;,
`
);

export const RowCell = styled(HeaderCell)(
  ({ theme }) => css`
    height: ${theme.spacing(6)};
    padding: ${theme.spacing(1.25, 1)};
  `
);

export const HiddenContent = styled(Box)(
  () => css`
    visibility: hidden;
  `
);

export const Row = styled(Box)(
  ({ theme }) => css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  &:hover {
    ${RowCell} {
      background-color: ${theme.palette.backgrounds.primary};
    }
    ${HiddenContent} {
      visibility: visible;
    }
  },
`
);
