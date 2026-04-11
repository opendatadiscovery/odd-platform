import styled from 'styled-components';

export const GroupsCaptionContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2.25),
}));
