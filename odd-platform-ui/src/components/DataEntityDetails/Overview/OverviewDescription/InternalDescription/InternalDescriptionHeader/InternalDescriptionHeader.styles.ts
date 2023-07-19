import styled from 'styled-components';

export const CaptionContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(1),
}));

export const About = styled('div')(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

export const Tooltip = styled('div')(({ theme }) => ({
  fontSize: '14px',
  padding: theme.spacing(1),
  maxWidth: '430px',
  border: '1px solid',
  borderRadius: '8px',
  borderColor: theme.palette.border.primary,
  boxShadow: theme.shadows[9],
}));
