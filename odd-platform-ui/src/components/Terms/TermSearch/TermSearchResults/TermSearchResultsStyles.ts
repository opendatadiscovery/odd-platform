import { Grid, type GridProps } from '@mui/material';
import styled from 'styled-components';
import { primaryTabsHeight, tabsContainerMargin, toolbarHeight } from 'lib/constants';

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

// Floor the table width so the flex columns stop compressing on narrow screens (the trailing
// Recently-viewed cell + its remove control would otherwise clip); the wrapper scrolls horizontally
// with the Term-name column pinned to the left (#1816 / CTRIB-044).
export const TERM_TABLE_MIN_WIDTH = 1100;

export const TermSearchResultsTableHeader = styled(Grid)<{ $scrollbarWidth: string }>(
  ({ theme, $scrollbarWidth }) => ({
    minWidth: TERM_TABLE_MIN_WIDTH,
    position: 'sticky',
    top: 0,
    zIndex: 2,
    backgroundColor: theme.palette.background.default,
    borderBottom: '1px solid',
    borderBottomColor: theme.palette.divider,
    paddingRight: $scrollbarWidth,
    flexWrap: 'nowrap',
  })
);

export const TermSearchResultsColContainer = styled(Grid)<{
  $colType: TermSearchResultsColType;
  $sticky?: boolean;
}>(({ theme, $colType, $sticky }) => ({
  ...termSearchResultsColWidthStyles.col,
  ...termSearchResultsColWidthStyles[$colType],
  ...($sticky && {
    position: 'sticky',
    left: 0,
    zIndex: 1,
    backgroundColor: theme.palette.background.default,
  }),
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
  // ONE scroll container for the header + rows: the header pins to the top, the Term-name column pins left,
  // and the table scrolls right past the trailing columns — they stay aligned (#1816 / CTRIB-044).
  overflow: 'auto',
}));
