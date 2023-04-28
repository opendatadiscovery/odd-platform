import styled from 'styled-components';

export const TruncatedList = styled('div')(({ theme }) => ({
  width: '100%',
  display: 'flex !important',
  flexWrap: 'wrap',
  marginBottom: theme.spacing(0.5),
  '& > *': { margin: theme.spacing(0.25, 0.25) },
}));
