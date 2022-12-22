import { Grid } from '@mui/material';
import { primaryTabsHeight, tabsContainerMargin, toolbarHeight } from 'lib/constants';
import styled from 'styled-components';

export const ListContainer = styled(Grid)(({ theme }) => ({
  height: `calc(100vh - ${toolbarHeight}px - ${primaryTabsHeight}px - ${tabsContainerMargin}px - ${theme.spacing(
    8
  )})`,
  overflowY: 'scroll',
  flexDirection: 'column',
  flexWrap: 'nowrap',
}));

export const Header = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(0.25, 2.5),
  justifyContent: 'flex-end',
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.border.primary,
}));
