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
type MainColNames = 'nm' | 'nd' | 'ow' | 'gr' | 'cr' | 'up' | 'st';
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
export type GridSizesByBreakpoints = { lg: ColGridSizes; md: ColGridSizes };
export type GridSizes = Record<SearchTabsNames, GridSizesByBreakpoints>;

export const gridSizes: GridSizes = {
  all: {
    lg: { nm: 2.68, nd: 2.28, ow: 2.08, gr: 2.28, st: 1, cr: 0.8, up: 0.8 },
    md: { nm: 2.68, nd: 2.28, ow: 2.08, gr: 2.28, st: 1, cr: 0.8, up: 0.8 },
  },
  my: {
    lg: { nm: 2.68, nd: 2.08, ow: 2.08, gr: 2.48, st: 1, cr: 0.8, up: 0.8 },
    md: { nm: 2.68, nd: 2.08, ow: 2.08, gr: 2.48, st: 1, cr: 0.8, up: 0.8 },
  },
  DATA_SET: {
    lg: {
      nm: 2.68,
      us: 0.54,
      rc: 1.04,
      nd: 1.82,
      ow: 1.62,
      gr: 1.62,
      st: 1,
      cr: 0.8,
      up: 0.8,
    },
    md: {
      nm: 2.68,
      us: 0.54,
      rc: 1.04,
      nd: 1.82,
      ow: 1.62,
      gr: 1.62,
      st: 1,
      cr: 0.8,
      up: 0.8,
    },
  },
  DATA_TRANSFORMER: {
    lg: {
      nm: 2.68,
      sr: 1.4,
      tr: 1.4,
      nd: 1.32,
      ow: 1.3,
      gr: 1.3,
      st: 1,
      cr: 0.8,
      up: 0.8,
    },
    md: {
      nm: 2.68,
      sr: 1.4,
      tr: 1.4,
      nd: 1.32,
      ow: 1.3,
      gr: 1.3,
      st: 1,
      cr: 0.8,
      up: 0.8,
    },
  },
  DATA_CONSUMER: {
    lg: { nm: 2.68, sr: 1.68, nd: 1.68, ow: 1.68, gr: 1.68, st: 1, cr: 0.8, up: 0.8 },
    md: { nm: 2.68, sr: 1.68, nd: 1.68, ow: 1.68, gr: 1.68, st: 1, cr: 0.8, up: 0.8 },
  },
  DATA_INPUT: {
    lg: { nm: 2.68, nd: 2.18, ow: 2.18, gr: 2.28, st: 1, cr: 0.8, up: 0.8 },
    md: { nm: 2.68, nd: 2.18, ow: 2.18, gr: 2.28, st: 1, cr: 0.8, up: 0.8 },
  },
  DATA_QUALITY_TEST: {
    lg: {
      nm: 2.68,
      en: 1.4,
      su: 1.4,
      nd: 1.32,
      ow: 1.3,
      gr: 1.3,
      st: 1,
      cr: 0.8,
      up: 0.8,
    },
    md: {
      nm: 2.68,
      en: 1.4,
      su: 1.4,
      nd: 1.32,
      ow: 1.3,
      gr: 1.3,
      st: 1,
      cr: 0.8,
      up: 0.8,
    },
  },
  DATA_ENTITY_GROUP: {
    lg: { nm: 2.68, ne: 1.09, nd: 1.91, ow: 1.81, gr: 1.91, st: 1, cr: 0.8, up: 0.8 },
    md: { nm: 2.68, ne: 1.09, nd: 1.91, ow: 1.81, gr: 1.91, st: 1, cr: 0.8, up: 0.8 },
  },
  DATA_RELATIONSHIP: {
    lg: { nm: 2.68, nd: 2.28, ow: 2.08, gr: 2.28, st: 1, cr: 0.8, up: 0.8 },
    md: { nm: 2.68, nd: 2.28, ow: 2.08, gr: 2.28, st: 1, cr: 0.8, up: 0.8 },
  },
};
