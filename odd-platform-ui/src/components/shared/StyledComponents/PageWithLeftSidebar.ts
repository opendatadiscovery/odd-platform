import styled from 'styled-components';
import { Grid } from '@mui/material';
import { maxSidebarWidth } from 'lib/constants';

export const MainContainer = styled('div')(({ theme }) => ({
  paddingTop: theme.spacing(2),
}));

export const ContentContainer = styled(Grid)(({ theme }) => ({
  paddingLeft: `${maxSidebarWidth}px`,
  paddingRight: theme.spacing(2),
}));

export const LeftSidebarContainer = styled(Grid)(({ theme }) => ({
  width: '100%',
  maxWidth: `${maxSidebarWidth}px`,
  position: 'fixed',
  left: 0,
  paddingRight: theme.spacing(2),
}));

export const ListContainer = styled(Grid)(({ theme }) => ({
  flexGrow: 1,
  maxWidth: '100%',
  marginLeft: theme.spacing(1),
}));
