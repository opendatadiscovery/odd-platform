import styled from 'styled-components';
import { Grid } from '@mui/material';
import {
  maxChannelsWidth,
  primaryTabsHeight,
  tabsContainerMargin,
  toolbarHeight,
} from 'lib/constants';

export const Container = styled('div')(({ theme }) => ({
  paddingLeft: `${maxChannelsWidth}px`,
}));

export const MessagesContainer = styled(Grid)(({ theme }) => ({
  // TODO change width
  width: '760px',

  height: `calc(100vh - ${toolbarHeight}px - ${primaryTabsHeight}px - ${tabsContainerMargin}px - ${theme.spacing(
    8.5
  )})`,
  overflowY: 'scroll',
  flexDirection: 'column',
  flexWrap: 'nowrap',
  paddingRight: theme.spacing(13),
  borderRight: '1px solid',
  borderRightColor: theme.palette.border.secondary,
}));
