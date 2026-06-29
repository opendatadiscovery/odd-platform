import type { GridSize } from '@mui/material';
import { Grid } from '@mui/material';
import styled from 'styled-components';
import { primaryTabsHeight, tabsContainerMargin, toolbarHeight } from 'lib/constants';
import type { DataEntityClassNameEnum } from 'generated-sources';

const searchHeight = 40;

export const ResultsTableHeader = styled(Grid)(({ theme }) => ({
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.divider,
  '& > *': { padding: theme.spacing(0, 1) },
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

// nm - Name
// nd - Namespace, Datasource
// ow - Owner
// gr - Group
// cr - Created
// up - Updated
// st - Status
// rv - Recently viewed (per-user; the cell is empty unless the asset is in the user's history)
type MainColNames = 'nm' | 'nd' | 'ow' | 'gr' | 'cr' | 'up' | 'st' | 'rv';
// us - Use
// rc - Rows / Columns
// sr - Sources
// tr - Targets
// en - Entities
// su - Suite URL
// ne - Number of entities
type AddColNames = 'us' | 'rc' | 'sr' | 'tr' | 'en' | 'su' | 'ne';

export type SearchTabsNames =
  | typeof DataEntityClassNameEnum.SET
  | typeof DataEntityClassNameEnum.CONSUMER
  | typeof DataEntityClassNameEnum.TRANSFORMER
  | typeof DataEntityClassNameEnum.INPUT
  | typeof DataEntityClassNameEnum.ENTITY_GROUP
  | typeof DataEntityClassNameEnum.QUALITY_TEST
  | typeof DataEntityClassNameEnum.RELATIONSHIP
  | 'all'
  | 'my';
export type ColGridSizes = Record<MainColNames, GridSize> &
  Partial<Record<AddColNames, GridSize>>;
export interface GridSizesByBreakpoints {
  lg: ColGridSizes;
  md: ColGridSizes;
}
export type GridSizes = Record<SearchTabsNames, GridSizesByBreakpoints>;

// The Recently-viewed column (rv) is carved from the namespace/owner/group columns (nd/ow/gr),
// NOT from the Name column (nm) — the name keeps its full width and, with the recency marker moved
// out of the name cell into this column, actually gains room (#1816 / CTRIB-042). Each variant's total
// is unchanged.
export const gridSizes: GridSizes = {
  all: {
    lg: { nm: 2.68, nd: 1.88, ow: 1.78, gr: 1.98, st: 1, cr: 0.8, up: 0.8, rv: 1 },
    md: { nm: 2.68, nd: 1.88, ow: 1.78, gr: 1.98, st: 1, cr: 0.8, up: 0.8, rv: 1 },
  },
  my: {
    lg: { nm: 2.68, nd: 1.68, ow: 1.78, gr: 2.18, st: 1, cr: 0.8, up: 0.8, rv: 1 },
    md: { nm: 2.68, nd: 1.68, ow: 1.78, gr: 2.18, st: 1, cr: 0.8, up: 0.8, rv: 1 },
  },
  DATA_SET: {
    lg: {
      nm: 2.68,
      us: 0.54,
      rc: 1.04,
      nd: 1.42,
      ow: 1.32,
      gr: 1.32,
      st: 1,
      cr: 0.8,
      up: 0.8,
      rv: 1,
    },
    md: {
      nm: 2.68,
      us: 0.54,
      rc: 1.04,
      nd: 1.42,
      ow: 1.32,
      gr: 1.32,
      st: 1,
      cr: 0.8,
      up: 0.8,
      rv: 1,
    },
  },
  DATA_TRANSFORMER: {
    lg: {
      nm: 2.68,
      sr: 1.4,
      tr: 1.4,
      nd: 0.92,
      ow: 1.0,
      gr: 1.0,
      st: 1,
      cr: 0.8,
      up: 0.8,
      rv: 1,
    },
    md: {
      nm: 2.68,
      sr: 1.4,
      tr: 1.4,
      nd: 0.92,
      ow: 1.0,
      gr: 1.0,
      st: 1,
      cr: 0.8,
      up: 0.8,
      rv: 1,
    },
  },
  DATA_CONSUMER: {
    lg: {
      nm: 2.68,
      sr: 1.68,
      nd: 1.28,
      ow: 1.38,
      gr: 1.38,
      st: 1,
      cr: 0.8,
      up: 0.8,
      rv: 1,
    },
    md: {
      nm: 2.68,
      sr: 1.68,
      nd: 1.28,
      ow: 1.38,
      gr: 1.38,
      st: 1,
      cr: 0.8,
      up: 0.8,
      rv: 1,
    },
  },
  DATA_INPUT: {
    lg: { nm: 2.68, nd: 1.78, ow: 1.88, gr: 1.98, st: 1, cr: 0.8, up: 0.8, rv: 1 },
    md: { nm: 2.68, nd: 1.78, ow: 1.88, gr: 1.98, st: 1, cr: 0.8, up: 0.8, rv: 1 },
  },
  DATA_QUALITY_TEST: {
    lg: {
      nm: 2.68,
      en: 1.4,
      su: 1.4,
      nd: 0.92,
      ow: 1.0,
      gr: 1.0,
      st: 1,
      cr: 0.8,
      up: 0.8,
      rv: 1,
    },
    md: {
      nm: 2.68,
      en: 1.4,
      su: 1.4,
      nd: 0.92,
      ow: 1.0,
      gr: 1.0,
      st: 1,
      cr: 0.8,
      up: 0.8,
      rv: 1,
    },
  },
  DATA_ENTITY_GROUP: {
    lg: {
      nm: 2.68,
      ne: 1.09,
      nd: 1.51,
      ow: 1.51,
      gr: 1.61,
      st: 1,
      cr: 0.8,
      up: 0.8,
      rv: 1,
    },
    md: {
      nm: 2.68,
      ne: 1.09,
      nd: 1.51,
      ow: 1.51,
      gr: 1.61,
      st: 1,
      cr: 0.8,
      up: 0.8,
      rv: 1,
    },
  },
  DATA_RELATIONSHIP: {
    lg: { nm: 2.68, nd: 1.88, ow: 1.78, gr: 1.98, st: 1, cr: 0.8, up: 0.8, rv: 1 },
    md: { nm: 2.68, nd: 1.88, ow: 1.78, gr: 1.98, st: 1, cr: 0.8, up: 0.8, rv: 1 },
  },
};
