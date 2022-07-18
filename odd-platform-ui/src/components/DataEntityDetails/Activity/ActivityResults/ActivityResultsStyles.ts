import { Grid } from '@mui/material';
import {
  primaryTabsHeight,
  tabsContainerMargin,
  toolbarHeight,
} from 'lib/constants';
import styled from 'styled-components';

const searchHeight = 40;

export const ContentContainer = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(0.25, 2.5),
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.divider,
  justifyContent: 'flex-end',
}));

export const ListContainer = styled(Grid)(({ theme }) => ({
  width: 'inherit',
  height: `calc(100vh - ${toolbarHeight}px - ${searchHeight}px - ${primaryTabsHeight}px - ${tabsContainerMargin}px - ${theme.spacing(
    8
  )})`,
  overflowY: 'scroll',
  flexDirection: 'column',
  flexWrap: 'nowrap',
}));
