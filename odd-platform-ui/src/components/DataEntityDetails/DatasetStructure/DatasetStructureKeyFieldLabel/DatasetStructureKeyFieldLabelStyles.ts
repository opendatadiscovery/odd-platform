import styled from 'styled-components';

export const Container = styled('div')(() => ({
  display: 'inline-flex',
  alignItems: 'center',
}));
export const FilledContainer = styled('span')(({ theme }) => ({
  fontSize: theme.typography.body2.fontSize,
  lineHeight: theme.typography.body2.lineHeight,
  borderRadius: '12px',
  border: '1px solid',
  padding: theme.spacing(0.25, 1),
  backgroundColor: theme.palette.alert.RESOLVED.background,
  borderColor: theme.palette.alert.RESOLVED.border,
  marginLeft: '10px',
}));
