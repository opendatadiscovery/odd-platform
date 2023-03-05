import styled, { type CSSObject } from 'styled-components';

export const Title = styled('foreignObject')(({ theme }) => ({
  fill: theme.palette.common.black,
  fontSize: theme.typography.h4.fontSize,
  fontWeight: theme.typography.h4.fontWeight,
  lineHeight: theme.typography.h4.lineHeight,
  cursor: 'pointer',
}));

export const TitleWrapper = styled('div')<{ $fullNames: boolean }>(
  ({ $fullNames }) =>
    ({
      wordBreak: $fullNames ? 'break-all' : 'initial',
      display: $fullNames ? 'flex' : 'block',
      alignItems: 'center',
      height: '100%',
      overflow: $fullNames ? 'initial' : 'hidden',
      textOverflow: $fullNames ? 'initial' : 'ellipsis',
      whiteSpace: $fullNames ? 'initial' : 'nowrap',
    } as CSSObject)
);

export const UnknownEntityNameCircle = styled('circle')(({ theme }) => ({
  cx: 5,
  cy: 0,
  r: 8,
  strokeWidth: 2,
  stroke: theme.palette.common.black,
}));

export const UnknownEntityNameCrossedLine = styled('rect')(({ theme }) => ({
  x: 0,
  y: 0.81418,
  width: 2,
  height: 17.37199,
  rx: 1,
  transform: 'rotate(-45deg) translateY(-6px) translateX(2.6px)',
  fill: theme.palette.common.black,
}));
