import styled from 'styled-components';
import { Grid } from '@mui/material';
import {
  maxChannelsWidth,
  primaryTabsHeight,
  tabsContainerMargin,
  toolbarHeight,
} from 'lib/constants';

export const Container = styled(Grid)(() => ({
  paddingLeft: `${maxChannelsWidth}px`,
  flexGrow: 1,
}));

export const MessagesContainer = styled(Grid)(({ theme }) => ({
  height: `calc(100vh - ${toolbarHeight}px - ${primaryTabsHeight}px - ${tabsContainerMargin}px - ${theme.spacing(
    8.5
  )})`,
  overflowY: 'scroll',
  flexDirection: 'column',
  flexWrap: 'nowrap',
  paddingRight: theme.spacing(13),
}));
