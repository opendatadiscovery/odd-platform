import React from 'react';
import { Theme } from '@mui/material/styles';
import { Tooltip, tooltipClasses, TooltipProps } from '@mui/material';
import styled, { CSSObject } from 'styled-components';

export type TooltipColorTypes = 'light' | 'dark';

interface TooltipStyleProps {
  $maxWidth: number;
  $type: TooltipColorTypes;
}

interface ChildrenContainerProps {
  $isCursorPointer: boolean;
  $isOverflowed: boolean;
}

const getTooltipStylesByType = (
  theme: Theme,
  type: TooltipColorTypes,
  $maxWidth?: number
): CSSObject => {
  if (type === 'dark')
    return {
      color: theme.palette.divider,
      maxWidth: `${$maxWidth}px`,
      borderRadius: '4px',
      padding: theme.spacing(0.25, 0.5),
      backgroundColor: theme.palette.info.dark,
    };

  return {
    color: theme.palette.texts.info,
    maxWidth: `${$maxWidth}px`,
    borderRadius: '4px',
    padding: theme.spacing(1),
    border: '1px solid',
    borderColor: theme.palette.divider,
    backgroundColor: theme.palette.background.default,
  };
};

export const AppTooltip = styled(
  ({ className, ...props }: TooltipProps) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Tooltip {...props} classes={{ popper: className }} />
  )
)<TooltipStyleProps>(({ theme, $type, $maxWidth }) => ({
  [`&.${tooltipClasses.popper}`]: {
    [`& .${tooltipClasses.tooltip}`]: {
      fontSize: theme.typography.body2.fontSize,
      fontWeight: theme.typography.body2.fontWeight,
      lineHeight: theme.typography.body2.lineHeight,
      ...getTooltipStylesByType(theme, $type, $maxWidth),
    },
  },
}));

export const ChildrenContainer = styled('div')<ChildrenContainerProps>(
  ({ theme, $isCursorPointer, $isOverflowed }) => ({
    cursor: $isCursorPointer ? 'pointer' : 'auto',
    overflow: $isOverflowed ? 'hidden' : 'initial',
  })
);
