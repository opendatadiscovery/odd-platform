import { Grid } from '@mui/material';
import { activitySidebarWidth } from 'lib/constants';
import styled from 'styled-components';

export const Container = styled(Grid)(({ theme }) => ({
  // padding: theme.spacing(2, 1, 1.5, 1),
  marginTop: theme.spacing(3),
  width: '100%',
  maxWidth: `${activitySidebarWidth}px`,
  position: 'fixed',
  // left: 0,
  // marginRight: theme.spacing(4),
}));

export const FiltersLoaderContainer = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(0, 3),
  justifyContent: 'center',
}));

export const ListContainer = styled('div')(() => ({
  // height: `calc(100vh - 110px - ${toolbarHeight}px)`,
}));
