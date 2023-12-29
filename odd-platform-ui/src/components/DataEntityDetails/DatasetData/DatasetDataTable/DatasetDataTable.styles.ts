import { Box } from '@mui/system';
import styled, { css } from 'styled-components';

export const Table = styled('table')(
  () => css`
    width: 100%;
    border-spacing: 0;
  `
);

export const Thead = styled('thead')(
  ({ theme }) => css`
    position: sticky;
    top: 0;
    background-color: ${theme.palette.backgrounds.default};
  `
);

export const Th = styled('th')(
  ({ theme }) => css`
    height: 100%;
    padding: ${theme.spacing(0, 1)};
    text-align: start;
    border-bottom: 1px solid ${theme.palette.border.primary};
  `
);

export const Td = styled('td')(
  ({ theme }) => css`
    height: ${theme.spacing(6)};
    padding: ${theme.spacing(0, 1)};
    border-bottom: 1px solid ${theme.palette.border.primary};
  `
);

export const HiddenBox = styled(Box)(
  () => css`
    visibility: hidden;
  `
);

export const Tr = styled('tr')(
  ({ theme }) => css`
    &:hover {
      background-color: ${theme.palette.backgrounds.primary};
      ${HiddenBox} {
        visibility: visible;
      }
    }
  `
);
