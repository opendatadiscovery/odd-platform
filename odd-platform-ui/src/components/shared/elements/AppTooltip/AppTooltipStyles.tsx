import React from 'react';
import type { Theme } from '@mui/material/styles';
import { Box, Tooltip, tooltipClasses, type TooltipProps } from '@mui/material';
import styled, { type CSSObject } from 'styled-components';

export type TooltipColorTypes = 'light' | 'dark';

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
