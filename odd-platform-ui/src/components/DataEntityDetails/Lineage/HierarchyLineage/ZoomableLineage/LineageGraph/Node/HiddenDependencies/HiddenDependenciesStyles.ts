import styled from 'styled-components';

export const Count = styled('text')(({ theme }) => ({
  fill: theme.palette.texts.primary,
  fontSize: theme.typography.body2.fontSize,
  fontWeight: theme.typography.body2.fontWeight,
  lineHeight: theme.typography.body2.lineHeight,
}));
