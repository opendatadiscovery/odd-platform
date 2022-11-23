import styled from 'styled-components';

export const Title = styled('text')(({ theme }) => ({
  fill: theme.palette.common.black,
  fontSize: theme.typography.h4.fontSize,
  fontWeight: theme.typography.h4.fontWeight,
  lineHeight: theme.typography.h4.lineHeight,
  cursor: 'pointer',
}));

export const UnknownEntityNameCircle = styled('circle')(({ theme }) => ({
  cx: 5,
  cy: 0,
  r: 5,
  strokeWidth: 2,
  stroke: theme.palette.common.black,
}));

export const UnknownEntityNameCrossedLine = styled('rect')(({ theme }) => ({
  x: 0,
  y: 0.81418,
  width: 2,
  height: 9.37199,
  rx: 1,
  transform: 'rotate(-45deg) translateY(-2px) translateX(2.4px)',
  fill: theme.palette.common.black,
}));
