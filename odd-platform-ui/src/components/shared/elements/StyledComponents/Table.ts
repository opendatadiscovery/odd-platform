import styled, { css } from 'styled-components';
import { Box } from '@mui/material';
import type { CSSProperties } from 'react';

// The standalone Query Examples list floors its width so the flex columns stop compressing on narrow
// screens (the trailing Recently-viewed cell + its remove control would otherwise clip); the container
// scrolls horizontally with the header pinned to the top and the first column pinned left (#1816 / CTRIB-044).
// The opt-in props default off, so the linked-QE / relationships tables that reuse these are unaffected.
export const QE_TABLE_MIN_WIDTH = 1100;

export const HeaderContainer = styled(Box)<{ $sticky?: boolean; $minWidth?: number }>(
  ({ theme, $sticky, $minWidth }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: `1px solid ${theme.palette.border.primary}`,
    padding: theme.spacing(0, 0.25, 0, 0),
    ...($minWidth ? { minWidth: $minWidth } : {}),
    ...($sticky
      ? {
          position: 'sticky',
          top: 0,
          zIndex: 2,
          backgroundColor: theme.palette.background.default,
        }
      : {}),
  })
);

export const Cell = styled('div')<{
  $flex: CSSProperties['flex'];
  $justifyContent?: CSSProperties['justifyContent'];
  $sticky?: boolean;
}>(({ theme, $flex, $justifyContent, $sticky }) => ({
  display: 'flex',
  flex: $flex,
  alignItems: 'center',
  justifyContent: $justifyContent || 'flex-start',
  overflow: 'hidden',
  padding: theme.spacing(0, 1),
  ...($sticky
    ? {
        position: 'sticky',
        left: 0,
        zIndex: 1,
        backgroundColor: theme.palette.background.default,
      }
    : {}),
}));

export const HiddenCell = styled(Cell)(
  () => css`
    visibility: hidden;
  `
);

export const RowContainer = styled(Box)<{ $minWidth?: number }>(
  ({ theme, $minWidth }) => css`
  min-width: ${$minWidth ? `${$minWidth}px` : 'auto'};
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
