import { Grid, type GridProps } from '@mui/material';
import { primaryTabsHeight, tabsContainerMargin, toolbarHeight } from 'lib/constants';
import styled from 'styled-components';

export type TermSearchResultsColType = 'col' | 'colxs' | 'colsm' | 'colmd' | 'collg';
export const termSearchResultsColWidthStyles = {
  colxs: { flex: '2 0 6%' },
  colsm: { flex: '2 0 7%' },
  colmd: { flex: '3 0 9%' },
  collg: { flex: '4 0 12%' },
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

const termSearchHeight = 40;

export const TermSearchResultsTableHeader = styled(Grid)<{ $scrollbarWidth: string }>(
  ({ theme, $scrollbarWidth }) => ({
    borderBottom: '1px solid',
    borderBottomColor: theme.palette.divider,
    marginTop: theme.spacing(2),
    paddingRight: $scrollbarWidth,
    flexWrap: 'nowrap',
  })
);

export const TermSearchResultsColContainer = styled(Grid)<{
  $colType: TermSearchResultsColType;
}>(({ $colType }) => ({
  ...termSearchResultsColWidthStyles.col,
  ...termSearchResultsColWidthStyles[$colType],
}));

export const TermSearchNameContainer = styled(Grid)<GridProps>(() => ({
  ...termSearchResultsColWidthStyles.col,
  padding: 0,
  justifyContent: 'flex-start',
  flexWrap: 'nowrap',
}));

export const TermSearchListContainer = styled(Grid)(({ theme }) => ({
  height: `calc(100vh - ${toolbarHeight}px - ${termSearchHeight}px - ${primaryTabsHeight}px - ${tabsContainerMargin}px - ${theme.spacing(
    8
  )})`,
  overflowY: 'scroll',
}));
