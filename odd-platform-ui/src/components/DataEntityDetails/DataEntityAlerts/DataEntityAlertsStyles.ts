import { Grid } from '@mui/material';
import styled from 'styled-components';
import { primaryTabsHeight, tabsContainerMargin, toolbarHeight } from 'lib/constants';

export const Container = styled(Grid)(({ theme }) => ({
  alignSelf: 'center',
  marginTop: theme.spacing(1),
}));

export const AlertsContainer = styled(Grid)(({ theme }) => ({
  flexDirection: 'column',
  flexWrap: 'nowrap',
  height: `calc(100vh - ${toolbarHeight}px - ${primaryTabsHeight}px - ${tabsContainerMargin}px - ${theme.spacing(
    14.5
  )})`,
  overflowY: 'scroll',
  marginTop: theme.spacing(1),
}));
