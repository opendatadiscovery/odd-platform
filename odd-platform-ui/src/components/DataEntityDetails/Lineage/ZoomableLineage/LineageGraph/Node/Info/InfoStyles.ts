import styled from 'styled-components';

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

export const Placeholder = styled('tspan')(({ theme }) => ({
  fill: theme.palette.texts.hint,
}));

export const ODDRNLabel = styled('text')(({ theme }) => ({
  fill: theme.palette.texts.secondary,
  fontSize: theme.typography.body1.fontSize,
  fontWeight: theme.typography.body1.fontWeight,
  lineHeight: theme.typography.body1.lineHeight,
}));

export const ODDRNWrapper = styled('div')(({ theme }) => ({
  color: theme.palette.texts.secondary,
  fontSize: theme.typography.body1.fontSize,
  fontWeight: theme.typography.body1.fontWeight,
  lineHeight: theme.typography.body1.lineHeight,
  wordBreak: 'break-all',
  display: 'flex',
  height: '100%',
  paddingTop: theme.spacing(1),
}));
