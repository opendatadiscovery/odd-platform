import styled from 'styled-components';

export const LoadMoreButton = styled('g')(({ theme }) => ({
  cursor: 'pointer',
  fill: theme.palette.button.primaryLight.normal.background,
  '&:hover': {
    fill: theme.palette.button.primaryLight.hover.background,
  },
  '&:active': {
    fill: theme.palette.button.primaryLight.active.background,
  },
}));

export const LoadMoreSpinner = styled('circle')(({ theme }) => ({
  fill: 'transparent',
  stroke: theme.palette.button.primaryLight.normal.color,
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
