import styled from 'styled-components';

export const Container = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'nowrap',
  width: '100%',
  borderTop: '1px solid',
  borderTopColor: theme.palette.divider,

  '& > div:last-child': {
    borderLeft: '1px solid',
    borderLeftColor: theme.palette.divider,
  },
}));

export const Item = styled('div')(() => ({
  flexBasis: '50%',
  maxWidth: '50%',
  flexGrow: 0,
}));
