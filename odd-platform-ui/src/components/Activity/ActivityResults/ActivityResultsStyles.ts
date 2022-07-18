import { Grid } from '@mui/material';
import {
  primaryTabsHeight,
  tabsContainerMargin,
  toolbarHeight,
} from 'lib/constants';
import styled from 'styled-components';

export const ListContainer = styled(Grid)(({ theme }) => ({
  height: `calc(100vh - ${toolbarHeight}px - ${primaryTabsHeight}px - ${tabsContainerMargin}px - ${theme.spacing(
    8
  )})`,
  overflowY: 'scroll',
  flexDirection: 'column',
  flexWrap: 'nowrap',
}));
