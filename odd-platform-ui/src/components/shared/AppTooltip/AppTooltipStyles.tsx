import React from 'react';
import { styled, Theme } from '@mui/material/styles';
import { propsChecker } from 'lib/helpers';
import {
  CSSObject,
  Tooltip,
  TooltipProps,
  tooltipClasses,
} from '@mui/material';

export type TooltipColorTypes = 'light' | 'dark';

interface TooltipStyleProps {
  $maxWidth: number;
  $type: TooltipColorTypes;
}

interface ChildrenContainerProps {
  $isCursorPointer: boolean;
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
  ),
  {
    shouldForwardProp: propsChecker,
  }
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

export const ChildrenContainer = styled('div', {
  shouldForwardProp: propsChecker,
})<ChildrenContainerProps>(({ theme, $isCursorPointer }) => ({
  cursor: $isCursorPointer ? 'pointer' : 'auto',
  overflow: 'hidden',
}));
