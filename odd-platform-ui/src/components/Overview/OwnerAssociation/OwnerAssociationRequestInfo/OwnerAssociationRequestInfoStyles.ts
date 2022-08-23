import styled from 'styled-components';

export const Container = styled('div')(({ theme }) => ({
  marginTop: theme.spacing(4),
  padding: theme.spacing(4.5, 3, 4, 3),
  border: '1px solid',
  borderColor: theme.palette.divider,
  borderRadius: '8px',
}));
