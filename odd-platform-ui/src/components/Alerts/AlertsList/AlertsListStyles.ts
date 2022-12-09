import { Grid } from '@mui/material';
import styled from 'styled-components';
import { primaryTabsHeight, tabsContainerMargin, toolbarHeight } from 'lib/constants';

export const AlertsContainer = styled(Grid)<{ $disableHeight: boolean }>(
  ({ theme, $disableHeight }) => ({
    flexDirection: 'column',
    flexWrap: 'nowrap',
    height: $disableHeight
      ? `calc(100vh - ${toolbarHeight}px - ${primaryTabsHeight}px - ${tabsContainerMargin}px - ${theme.spacing(
          14.5
        )})`
      : 'unset',
    overflowY: 'scroll',
    marginTop: theme.spacing(1),
  })
);
