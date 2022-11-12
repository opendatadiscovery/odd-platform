import styled from 'styled-components';
import { Grid } from '@mui/material';
import { primaryTabsHeight, tabsContainerMargin, toolbarHeight } from 'lib/constants';

export const Container = styled(Grid)(({ theme }) => ({
  height: `calc(100vh - ${toolbarHeight}px - ${primaryTabsHeight}px - ${tabsContainerMargin}px - ${theme.spacing(
    8.5
  )})`,
  overflowY: 'scroll',
  alignItems: 'center',
  justifyContent: 'center',
  borderLeft: '1px solid',
  borderLeftColor: theme.palette.border.secondary,
}));
