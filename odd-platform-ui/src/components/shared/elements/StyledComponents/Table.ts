import styled, { css } from 'styled-components';
import { Box } from '@mui/material';
import type { CSSProperties } from 'react';

export const HeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: `1px solid ${theme.palette.border.primary}`,
  padding: theme.spacing(0, 0.25, 0, 0),
}));

export const Cell = styled('div')<{
  $flex: CSSProperties['flex'];
  $justifyContent?: CSSProperties['justifyContent'];
}>(({ theme, $flex, $justifyContent }) => ({
  display: 'flex',
  flex: $flex,
  alignItems: 'center',
  justifyContent: $justifyContent || 'flex-start',
  overflow: 'hidden',
  padding: theme.spacing(0, 1),
}));

export const HiddenCell = styled(Cell)(
  () => css`
    visibility: hidden;
  `
);

export const RowContainer = styled(Box)(
  ({ theme }) => css`
  display: flex;
  align-items: center;
  padding: ${theme.spacing(1.25, 0)};
  justify-content: space-between;
  border-bottom: 1px solid ${theme.palette.border.primary};
  &:hover {
    background-color: ${theme.palette.backgrounds.primary};
    ${HiddenCell} {
      visibility: visible;
    }
  },
`
);
