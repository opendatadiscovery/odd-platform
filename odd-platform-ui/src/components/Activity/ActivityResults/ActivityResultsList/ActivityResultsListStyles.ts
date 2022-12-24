import styled from 'styled-components';
import { Grid } from '@mui/material';
import { primaryTabsHeight, tabsContainerMargin, toolbarHeight } from 'lib/constants';

export const ListContainer = styled(Grid)(({ theme }) => ({
  height: `calc(100vh - ${toolbarHeight}px - ${primaryTabsHeight}px - ${tabsContainerMargin}px - ${theme.spacing(
    8
  )})`,
  overflow: 'auto',
  flexDirection: 'column',
  flexWrap: 'nowrap',
  marginTop: theme.spacing(1),
}));
