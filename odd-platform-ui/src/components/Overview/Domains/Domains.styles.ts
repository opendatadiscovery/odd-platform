import styled from 'styled-components';
import { maxContentWidthWithoutSidebar } from 'lib/constants';

export const Container = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  marginTop: theme.spacing(5),
}));

export const ListContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  marginTop: theme.spacing(1),

  [theme.breakpoints.down(maxContentWidthWithoutSidebar + 1)]: {
    justifyContent: 'space-between',
  },
}));
