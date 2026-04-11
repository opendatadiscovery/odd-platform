import styled from 'styled-components';
import { Grid } from '@mui/material';
import {
  maxChannelsWidth,
  primaryTabsHeight,
  tabsContainerMargin,
  toolbarHeight,
} from 'lib/constants';

export const Container = styled(Grid)(() => ({
  maxWidth: `${760 + maxChannelsWidth}px`,
  paddingLeft: `${maxChannelsWidth}px`,
  flexGrow: 1,
  alignContent: 'baseline',
}));

export const MessagesContainer = styled('div')<{ $disableHeight: boolean }>(
  ({ theme, $disableHeight }) => ({
    height: !$disableHeight
      ? `calc(100vh - ${toolbarHeight}px - ${primaryTabsHeight}px - ${tabsContainerMargin}px - ${theme.spacing(
          10
        )})`
      : '0px',
    display: 'flex',
    width: '100%',
    overflowY: 'scroll',
    flexDirection: 'column',
    flexWrap: 'nowrap',
    paddingRight: !$disableHeight ? theme.spacing(13) : 0,
  })
);
