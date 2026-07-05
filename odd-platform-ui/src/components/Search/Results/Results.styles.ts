import { Grid } from '@mui/material';
import styled from 'styled-components';
import { primaryTabsHeight, tabsContainerMargin, toolbarHeight } from 'lib/constants';

const searchHeight = 40;

// The list columns lay out proportionally; below this width they compress until the trailing columns
// (Status / Created / Updated / Recently viewed + its remove control) clip and become unreachable. Floor
// the table at this width and let the wrapper scroll horizontally, with the Name column pinned so it stays
// in view while scrolling right — the AWS-Athena wide-table pattern (#1816 / CTRIB-044).
export const SEARCH_TABLE_MIN_WIDTH = 1320;

// ONE scroll container for BOTH the header and the rows, so they scroll together and stay aligned. The
// header pins to the top and the Name column pins to the left; the table floors at SEARCH_TABLE_MIN_WIDTH
// and scrolls right to reach the trailing columns — the AWS-Athena wide-table pattern (#1816 / CTRIB-044).
export const ListContainer = styled(Grid)(({ theme }) => ({
  // max-height (not a fixed height) so the box shrinks to the rows when there are few results — the
  // horizontal scrollbar then sits right under the rows instead of at the bottom of a viewport-tall box.
  maxHeight: `calc(100vh - ${toolbarHeight}px - ${searchHeight}px - ${primaryTabsHeight}px - ${tabsContainerMargin}px - ${theme.spacing(
    11.5
  )})`,
  overflow: 'auto',
  // A wide table that overflows needs a CLEARLY VISIBLE horizontal scrollbar to reach the trailing columns
  // (Status / Created / Updated / Recently viewed + its remove). The global 4px near-white bar is too easy to
  // miss on a table this wide, so make this one prominent and usable (#1816 / CTRIB-044).
  '&::-webkit-scrollbar:horizontal': { height: '12px' },
  '&::-webkit-scrollbar-thumb:horizontal': {
    backgroundColor: '#C1C7D0',
    borderRadius: '6px',
    border: '3px solid transparent',
    backgroundClip: 'content-box',
    '&:hover': { backgroundColor: '#8993A4' },
  },
  '&::-webkit-scrollbar-track:horizontal': { backgroundColor: '#F4F5F7' },
}));

export const ResultsTableHeader = styled(Grid)(({ theme }) => ({
  minWidth: SEARCH_TABLE_MIN_WIDTH,
  position: 'sticky',
  top: 0,
  zIndex: 2,
  backgroundColor: theme.palette.background.default,
  borderBottom: '1px solid',
  borderBottomColor: theme.palette.divider,
  '& > *': { padding: theme.spacing(0, 1) },
}));

export const SearchCol = styled(Grid)<{ $sticky?: boolean; $stickyRight?: boolean }>(
  ({ theme, $sticky, $stickyRight }) => ({
    display: 'flex',
    overflow: 'hidden',
    paddingRight: '8px',
    paddingLeft: '8px',
    // The Name column is pinned to the LEFT edge and the Recently-viewed column to the RIGHT edge while the
    // middle columns scroll horizontally between them — so the recency value + its remove control are always
    // on screen on a narrow viewport, no scrolling required. Each pinned column needs an opaque background so
    // the scrolling columns pass behind it, not through it (#1816 / CTRIB-044).
    ...($sticky && {
      position: 'sticky',
      left: 0,
      zIndex: 1,
      backgroundColor: theme.palette.background.default,
    }),
    ...($stickyRight && {
      position: 'sticky',
      right: 0,
      zIndex: 1,
      backgroundColor: theme.palette.background.default,
    }),
  })
);

// ST-4 (#1838) — the cross-kind results table is ONE kind-agnostic column set. The per-entity-class grids
// (Datasets / Transformers / …) are retired with the class tabs: a mixed DE + Term + Query-Example page has no
// single "class" to switch columns on, and the polymorphic `Asset` payload (per-kind `*Ref`s) only carries the
// columns below. Each kind fills what its ref supports and the rest render empty (PLT-147 clean-degrade):
//   Data Entity  → Name (+ staleness / highlight) · Type (kind + class chips) · Status · Recently viewed
//   Term         → Name · Type · Namespace · Updated · Recently viewed
//   Query Example→ Name · Type · Recently viewed
// Sizes sum to 12 (lg == md); Name is pinned left and Recently-viewed pinned right (the #1816 wide-table pattern).
export type AssetResultColName = 'nm' | 'ty' | 'nd' | 'st' | 'up' | 'rv';

export const ASSET_RESULT_COLS: Record<AssetResultColName, number> = {
  nm: 3.5, // Name (+ staleness / highlight / favorite star), sticky-left
  ty: 2.5, // Type (the asset kind + the Data-Entity class chips)
  nd: 2, // Namespace (Term)
  st: 1.2, // Status (Data Entity)
  up: 1.3, // Updated (Term)
  rv: 1.5, // Recently viewed (per-user; empty unless in the user's history), sticky-right
};
