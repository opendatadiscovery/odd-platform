import { Box } from '@mui/system';
import styled, { css } from 'styled-components';

export const Table = styled('table')(
  () => css`
    width: 100%;
    border-collapse: collapse;
  `
);

export const Thead = styled('thead')(
  ({ theme }) => css`
    border-bottom: 1px solid ${theme.palette.border.primary};
  `
);

export const Th = styled('th')(
  ({ theme }) => css`
    height: 100%;
    padding: ${theme.spacing(0, 1)};
    text-align: start;
  `
);

export const Td = styled('td')(
  ({ theme }) => css`
    height: ${theme.spacing(6)};
    padding: ${theme.spacing(0, 1)};
  `
);

export const HiddenBox = styled(Box)(
  () => css`
    visibility: hidden;
  `
);

export const Tr = styled('tr')(
  ({ theme }) => css`
    border-bottom: 1px solid ${theme.palette.border.primary};
    &:hover {
      background-color: ${theme.palette.backgrounds.primary};
      ${HiddenBox} {
        visibility: visible;
      }
    }
  `
);
