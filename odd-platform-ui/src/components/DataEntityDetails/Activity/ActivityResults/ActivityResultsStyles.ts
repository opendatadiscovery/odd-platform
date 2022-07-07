import { Grid } from '@mui/material';
import styled from 'styled-components';
import { activitySidebarWidth } from 'lib/constants';

export const ListContainer = styled(Grid)(({ theme }) => ({
  paddingLeft: `${activitySidebarWidth + 32}px`,
  // height: `calc(100vh - ${toolbarHeight}px - ${searchHeight}px - ${primaryTabsHeight}px - ${tabsContainerMargin}px - ${theme.spacing(
  //   8
  // )})`,
  // overflowY: 'scroll',
}));
