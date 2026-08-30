import React from 'react';
import type { Theme } from '@mui/material/styles';
import { Box, Tooltip, tooltipClasses, type TooltipProps } from '@mui/material';
import styled, { type CSSObject } from 'styled-components';

export type TooltipColorTypes = 'light' | 'dark' | 'termLink';

interface TooltipStyleProps extends TooltipProps {
  $type: TooltipColorTypes;
}

const getTooltipStylesByType = (theme: Theme, type: TooltipColorTypes): CSSObject => {
  if (type === 'dark')
    return {
      color: theme.palette.divider,
      borderRadius: '4px',
      padding: theme.spacing(0.25, 0.5),
      backgroundColor: theme.palette.info.dark,
    };

  if (type === 'termLink') {
    return {
      padding: theme.spacing(1),
      borderRadius: '8px',
      boxShadow: theme.shadows[6],
      color: theme.palette.texts.info,
      backgroundColor: theme.palette.background.default,
      border: `1px solid ${theme.palette.border.primary}`,
    };
  }

  return {
    color: theme.palette.texts.info,
    borderRadius: '4px',
    backgroundColor: theme.palette.background.default,
  };
};

export const AppTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))<TooltipStyleProps>(({ theme, $type }) => ({
  [`&.${tooltipClasses.popper}`]: {
    maxWidth: 'unset',
    [`& .${tooltipClasses.tooltip}`]: {
      maxWidth: 'unset',
      padding: 0,
      fontSize: theme.typography.body2.fontSize,
      fontWeight: theme.typography.body2.fontWeight,
      lineHeight: theme.typography.body2.lineHeight,
      ...getTooltipStylesByType(theme, $type),
    },
  },
}));

export const ChildrenContainer = styled(Box)<{ $isOverflowed: boolean }>(
  ({ $isOverflowed }) => ({
    cursor: 'pointer',
    overflow: $isOverflowed ? 'hidden' : 'initial',
    ...($isOverflowed ? { minWidth: '0px' } : {}),
  })
);

// The shared styled body for an informational AppTooltip. The "light" popper supplies only a flat
// `background.default` with `padding: 0` and `maxWidth: 'unset'`, so the CONTENT must bring its own padding, a
// max width (so it wraps), and the border / radius / shadow that make it read as a card. Passing a bare string
// instead renders one unwrapped, edge-to-edge, background-less row of text - the defect LSN-035 caught.
// Lives here (next to the tooltip it styles) rather than inside one feature's style sheet, so every inline
// "(i)" help affordance on the platform shares one body instead of copying it (ADR-0076).
export const TooltipBody = styled('div')(({ theme }) => ({
  fontSize: '14px',
  lineHeight: 1.5,
  padding: theme.spacing(1),
  maxWidth: '360px',
  whiteSpace: 'normal',
  border: '1px solid',
  borderRadius: '8px',
  borderColor: theme.palette.border.primary,
  boxShadow: theme.shadows[9],
}));
