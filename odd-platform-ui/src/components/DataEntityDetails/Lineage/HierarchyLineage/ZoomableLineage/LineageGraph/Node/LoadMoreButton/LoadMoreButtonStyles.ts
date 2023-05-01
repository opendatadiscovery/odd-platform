import styled from 'styled-components';
import { Group } from '@visx/group';

export const LoadMoreButton = styled(Group)(({ theme }) => ({
  cursor: 'pointer',
  fill: theme.palette.button.secondary.normal.background,
  '&:hover': {
    fill: theme.palette.button.secondary.hover.background,
  },
  '&:active': {
    fill: theme.palette.button.secondary.active.background,
  },
}));

export const LoadMoreSpinner = styled('circle')(({ theme }) => ({
  fill: 'transparent',
  strokeWidth: 2,
  strokeDasharray: 2 * Math.PI * 8,
  stroke: theme.palette.border.element,
  strokeLinecap: 'round',
  animation: 'dash 1.5s ease-in-out infinite',
  '@keyframes dash': {
    '0%': {
      strokeDasharray: '1, 150',
      strokeDashoffset: 0,
    },
    '50%': {
      strokeDasharray: '90, 150',
      strokeDashoffset: -35,
    },
    '100%': {
      strokeDasharray: '90, 150',
      strokeDashoffset: -124,
    },
  },
}));

export const LoadMoreSpinnerBackground = styled('circle')(({ theme }) => ({
  fill: 'transparent',
  stroke: theme.palette.common.white,
}));

export const LoadMoreButtonName = styled('text')(({ theme }) => ({
  fontSize: theme.typography.body2.fontSize,
  fill: theme.palette.texts.action,
  textAnchor: 'middle',
}));
