import styled, { css, keyframes } from 'styled-components';
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

const dash = keyframes`
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
`;

export const LoadMoreSpinner = styled.circle(
  ({ theme }) => css`
    fill: transparent;
    stroke-width: 2;
    stroke-dasharray: ${2 * Math.PI * 8};
    stroke: ${theme.palette.border.element};
    stroke-linecap: round;
    animation: ${dash} 1.5s ease-in-out infinite;
  `
);

export const LoadMoreSpinnerBackground = styled('circle')(({ theme }) => ({
  fill: 'transparent',
  stroke: theme.palette.common.white,
}));

export const LoadMoreButtonName = styled('text')(({ theme }) => ({
  fontSize: theme.typography.body2.fontSize,
  fill: theme.palette.texts.action,
  textAnchor: 'middle',
}));
