import styled from 'styled-components';

export const Tooltip = styled('div')(({ theme }) => ({
  fontSize: '14px',
  padding: theme.spacing(1),
  maxWidth: '430px',
  border: '1px solid',
  borderRadius: '8px',
  borderColor: theme.palette.border.primary,
  boxShadow: theme.shadows[9],
}));

export const Definition = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
}));
