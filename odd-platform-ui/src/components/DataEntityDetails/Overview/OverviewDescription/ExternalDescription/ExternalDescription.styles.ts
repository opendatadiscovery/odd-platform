import styled from 'styled-components';

export const Container = styled('div')(({ theme }) => ({
  paddingTop: theme.spacing(2),
  marginTop: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
}));
