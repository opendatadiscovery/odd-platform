import { Grid, GridProps } from '@mui/material';
import {
  primaryTabsHeight,
  tabsContainerMargin,
  toolbarHeight,
} from 'lib/constants';
import styled from 'styled-components';

export type ColType = 'col' | 'colxs' | 'colsm' | 'colmd' | 'collg';
export const colWidthStyles = {
  colxs: {
    flex: '2 0 6%',
  },
  colsm: {
    flex: '2 0 7%',
  },
  colmd: {
    flex: '3 0 9%',
  },
  collg: {
    flex: '4 0 12%',
  },
  col: {
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    paddingRight: '8px',
    paddingLeft: '8px',
    '&:last-of-type': {
      paddingRight: 0,
    },
  },
};

const searchHeight = 40;

export const ResultsTableHeader = styled(Grid)(({ theme }) => ({
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.divider,
}));

export const ColContainer = styled(Grid)<{
  $colType: ColType;
}>(({ $colType }) => ({
  ...colWidthStyles.col,
  ...colWidthStyles[$colType],
}));

export const NameContainer = styled(Grid)<GridProps>(() => ({
  ...colWidthStyles.col,
  padding: 0,
  justifyContent: 'flex-start',
  flexWrap: 'nowrap',
}));

export const ListContainer = styled(Grid)(({ theme }) => ({
  height: `calc(100vh - ${toolbarHeight}px - ${searchHeight}px - ${primaryTabsHeight}px - ${tabsContainerMargin}px - ${theme.spacing(
    8
  )})`,
  overflowY: 'scroll',
}));
