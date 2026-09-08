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
    // Deliberately NO width cap on this branch. It is the DEFAULT type, and SearchHighlights (640px), the
    // DataEntityDetailsPreview card (400-800px) and the relationship-key tooltip (430px) hand it elements that
    // carry their own width; a popper-level `maxWidth` clamps the card and lets the content paint outside it
    // (measured 2026-09-08 when a 360px cap was tried here: 280px of overflow on every search-result highlight).
    // The wrap width for plain-string help lives on `TooltipBody`, which `AppTooltip` applies to those itself.
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

// The shared styled body for an informational AppTooltip: padding, a wrap width, and the border / radius /
// shadow that make it read as a card. The "light" popper supplies only a flat `background.default` with
// `padding: 0` and `maxWidth: 'unset'` — deliberately, see getTooltipStylesByType — so the CONTENT brings the
// padding, the wrap width and the card treatment. `AppTooltip` wraps a plain-string title in this body itself for
// light informational tooltips (`checkForOverflow={false}`), so a call site cannot reintroduce the bare
// edge-to-edge row (LSN-035, and its 2026-09 repeat on the Last-viewed facet) by omission; an element title is
// the caller's own body and passes through with the width it declared.
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
