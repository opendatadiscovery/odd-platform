import { Grid } from '@mui/material';
import styled from 'styled-components';
import { primaryTabsHeight, tabsContainerMargin, toolbarHeight } from 'lib/constants';

const searchHeight = 40;

// ST-13a (#1847) — the table is as wide as its columns: every rendered column carries a `minWidth` in the field
// catalog (`lib/search/resultColumns.ts`) and the table's floor is their sum (`minWidthFor(layout)`), so a 12-column
// layout scrolls instead of compressing until the trailing columns clip (the #1816 / CTRIB-044 class), and a
// 5-column layout does not reserve room it does not use. The wrapper scrolls horizontally with the Name column
// pinned left and the Recently-viewed column pinned right — the AWS-Athena wide-table pattern (#1816 / CTRIB-044).

// ONE scroll container for BOTH the header and the rows, so they scroll together and stay aligned. The
// header pins to the top and the Name column pins to the left; the table floors at the layout's width
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

export const ResultsTableHeader = styled(Grid)<{ $minWidth: number }>(
  ({ theme, $minWidth }) => ({
    minWidth: $minWidth,
    position: 'sticky',
    top: 0,
    zIndex: 2,
    backgroundColor: theme.palette.background.default,
    borderBottom: '1px solid',
    borderBottomColor: theme.palette.divider,
    '& > *': { padding: theme.spacing(0, 1) },
  })
);

export const SearchCol = styled(Grid)<{
  $width?: number;
  $grow?: boolean;
  $sticky?: boolean;
  $stickyRight?: boolean;
}>(({ theme, $width, $grow, $sticky, $stickyRight }) => ({
  display: 'flex',
  overflow: 'hidden',
  paddingRight: '8px',
  paddingLeft: '8px',
  // ST-13a — a column is exactly its catalog width; the Name column additionally takes whatever room the
  // container has beyond the layout's floor (so a narrow layout still fills the page).
  ...($width !== undefined && {
    flex: $grow ? `1 1 ${$width}px` : `0 0 ${$width}px`,
    minWidth: $width,
    maxWidth: $grow ? undefined : $width,
  }),
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
}));

// ST-13a — the two empty-cell states, distinct for a screen reader (the GitLab Pajamas rule: an em dash plus
// visually-hidden text, never a bare blank): "Not applicable" when the row's kind does not carry the column,
// "No value" when it does but nothing is set. The dash is aria-hidden so the reader hears the text, not "dash".
export const EmptyCell = styled('span')(({ theme }) => ({
  color: theme.palette.texts.hint,
}));

export const VisuallyHidden = styled('span')({
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
});

// ST-13a — an optional column's header label: a real (keyboard-reachable) element so its "Applies to" tooltip opens
// on focus as well as hover, styled as plain text. A button rather than a focusable span because it IS going to be
// the interactive element — ST-13b hangs the per-column sort menu on exactly this control.
export const HeaderLabel = styled('button')(({ theme }) => ({
  all: 'unset',
  cursor: 'default',
  display: 'inline-flex',
  alignItems: 'center',
  maxWidth: '100%',
  overflow: 'hidden',
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.border.element}`,
    borderRadius: '4px',
  },
}));
