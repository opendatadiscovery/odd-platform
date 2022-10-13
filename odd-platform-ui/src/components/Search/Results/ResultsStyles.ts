import { Grid, GridProps, GridSize } from '@mui/material';
import { primaryTabsHeight, tabsContainerMargin, toolbarHeight } from 'lib/constants';
import styled from 'styled-components';
import { DataEntityClassNameEnum } from 'generated-sources';

export type ColType = 'col' | 'colxs' | 'colsm' | 'colmd' | 'collg';
export const colWidthStyles = {
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
    '&:last-of-type': { paddingRight: 0 },
  },
};

const searchHeight = 40;

export const ResultsTableHeader = styled(Grid)(({ theme }) => ({
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.divider,
  '& > *': { padding: theme.spacing(0, 1) },
}));

export const ColContainer = styled(Grid)<{
  $colType: ColType;
}>(({ $colType }) => ({ ...colWidthStyles.col, ...colWidthStyles[$colType] }));

export const NameContainer = styled(Grid)<GridProps>(() => ({
  ...colWidthStyles.col,
  padding: 0,
  justifyContent: 'flex-start',
  flexWrap: 'nowrap',
}));

export const ListContainer = styled(Grid)(({ theme }) => ({
  height: `calc(100vh - ${toolbarHeight}px - ${searchHeight}px - ${primaryTabsHeight}px - ${tabsContainerMargin}px - ${theme.spacing(
    11.5
  )})`,
  overflowY: 'scroll',
}));

export const SearchCol = styled(Grid)(() => ({
  display: 'flex',
  overflow: 'hidden',
  paddingRight: '8px',
  paddingLeft: '8px',
}));

type MainColNames = 'nm' | 'nd' | 'ow' | 'gr' | 'cr' | 'up';
type AddColNames = 'us' | 'rc' | 'sr' | 'tr' | 'en' | 'su' | 'ne';

export type SearchTabsNames =
  | Exclude<
      DataEntityClassNameEnum,
      DataEntityClassNameEnum.QUALITY_TEST_RUN | DataEntityClassNameEnum.TRANSFORMER_RUN
    >
  | 'all'
  | 'my';

export type ColGridSizes = Record<MainColNames, GridSize> &
  Partial<Record<AddColNames, GridSize>>;
export type GridSizesByBreakpoints = { lg: ColGridSizes };
export type GridSizes = Record<SearchTabsNames, GridSizesByBreakpoints>;
export const gridSizes: GridSizes = {
  all: { lg: { nm: 2.88, nd: 2.28, ow: 2.28, gr: 2.48, cr: 1, up: 1 } },
  my: { lg: { nm: 2.88, nd: 2.08, ow: 2.08, gr: 2.88, cr: 1, up: 1 } },
  DATA_SET: {
    lg: { nm: 2.88, us: 0.54, rc: 1.04, nd: 1.82, ow: 1.82, gr: 1.82, cr: 1, up: 1 },
  },
  DATA_TRANSFORMER: {
    lg: { nm: 2.88, sr: 1.4, tr: 1.4, nd: 1.52, ow: 1.4, gr: 1.4, cr: 1, up: 1 },
  },
  DATA_CONSUMER: {
    lg: { nm: 2.88, sr: 1.78, nd: 1.78, ow: 1.78, gr: 1.78, cr: 1, up: 1 },
  },
  DATA_INPUT: { lg: { nm: 2.88, nd: 2.28, ow: 2.28, gr: 2.48, cr: 1, up: 1 } },
  DATA_QUALITY_TEST: {
    lg: { nm: 2.88, en: 1.4, su: 1.4, nd: 1.52, ow: 1.4, gr: 1.4, cr: 1, up: 1 },
  },
  DATA_ENTITY_GROUP: {
    lg: { nm: 2.88, ne: 1.09, nd: 2.01, ow: 2.01, gr: 2.01, cr: 1, up: 1 },
  },
};
