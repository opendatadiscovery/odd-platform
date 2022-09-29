import React from 'react';
import { Theme } from '@mui/material/styles';
import { Box, Tooltip, tooltipClasses, TooltipProps } from '@mui/material';
import styled, { CSSObject } from 'styled-components';

export type TooltipColorTypes = 'light' | 'dark';

interface TooltipStyleProps extends TooltipProps {
  $type: TooltipColorTypes;
}

interface ChildrenContainerProps {
  $isCursorPointer: boolean;
  $isOverflowed: boolean;
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
    padding: theme.spacing(1),
    border: '1px solid',
    borderColor: theme.palette.divider,
    backgroundColor: theme.palette.background.default,
  };
};

export const AppTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))<TooltipStyleProps>(({ theme, $type }) => ({
  [`&.${tooltipClasses.popper}`]: {
    [`& .${tooltipClasses.tooltip}`]: {
      fontSize: theme.typography.body2.fontSize,
      fontWeight: theme.typography.body2.fontWeight,
      lineHeight: theme.typography.body2.lineHeight,
      ...getTooltipStylesByType(theme, $type),
    },
  },
}));

export const ChildrenContainer = styled(Box)<ChildrenContainerProps>(
  ({ $isCursorPointer, $isOverflowed }) => ({
    cursor: $isCursorPointer ? 'pointer' : 'inherit',
    overflow: $isOverflowed ? 'hidden' : 'initial',
    ...($isOverflowed ? { maxWidth: '0px', minWidth: '100%' } : {}),
  })
);
