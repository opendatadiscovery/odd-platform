import styled from 'styled-components';

export const Container = styled('div')(({ theme }) => ({
  display: 'flex',
  width: '100%',
  marginTop: theme.spacing(2),
  justifyContent: 'stretch',
  alignItems: 'stretch',
  justifySelf: 'stretch',
  flexGrow: 1,
}));
