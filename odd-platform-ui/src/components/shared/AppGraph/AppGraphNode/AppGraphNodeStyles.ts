import { DataEntityClassNameEnum } from 'generated-sources';
import styled from 'styled-components';

export const NodeContainer = styled('g')(({ theme }) => ({
  fill: theme.palette.background.default,
  rx: 2,
  '&:hover': {
    '-webkit-filter': `drop-shadow(${theme.shadows[9]})`,
    filter: `drop-shadow(${theme.shadows[9]})`,
  },
}));

export const RootNodeRect = styled('rect')<{ $parent: boolean }>(
  ({ theme, $parent }) => ({
    stroke: theme.palette.button.primary.normal.border,
    strokeWidth: $parent ? 0 : 1,
    rx: 8,
  })
);

export const Title = styled('text')(({ theme }) => ({
  fill: theme.palette.common.black,
  fontSize: theme.typography.h4.fontSize,
  fontWeight: theme.typography.h4.fontWeight,
  lineHeight: theme.typography.h4.lineHeight,
  cursor: 'pointer',
}));

export const Attribute = styled('text')(({ theme }) => ({
  fill: theme.palette.common.black,
  fontSize: theme.typography.body1.fontSize,
  fontWeight: theme.typography.body1.fontWeight,
  lineHeight: theme.typography.body1.lineHeight,
  width: '168px',
  overflow: 'hidden',
}));

export const AttributeLabel = styled('tspan')(({ theme }) => ({
  fill: theme.palette.text.secondary,
}));

export const Count = styled('text')(({ theme }) => ({
  fill: theme.palette.texts.hint,
  fontSize: theme.typography.body2.fontSize,
  fontWeight: theme.typography.body2.fontWeight,
  lineHeight: theme.typography.body2.lineHeight,
}));

export const Placeholder = styled('tspan')<{ $show: boolean }>(({ theme, $show }) => ({
  fill: theme.palette.texts.hint,
  display: $show ? 'initial' : 'none',
}));

export const EntityClassContainer = styled('rect')<{
  $entityClassName: DataEntityClassNameEnum;
}>(({ theme, $entityClassName }) => ({
  fill: theme.palette.entityClass[$entityClassName],
  rx: 4,
}));

export const TypeLabel = styled('text')(({ theme }) => ({
  fill: theme.palette.common.black,
  fontSize: theme.typography.body2.fontSize,
  fontWeight: theme.typography.body2.fontWeight,
  lineHeight: theme.typography.body2.lineHeight,
  textAnchor: 'middle',
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
