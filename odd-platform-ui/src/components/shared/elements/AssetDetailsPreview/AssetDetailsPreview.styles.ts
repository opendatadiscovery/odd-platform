import { Grid, Typography } from '@mui/material';
import styled from 'styled-components';

// The card frame — shared by the three kinds. Width as the DE card always had; the height bound rose from 50vh to
// 80vh with #1899 (a Term / Query Example card carries more sections than the DE card), and the body inside it is a
// ClampedBlock at the same bound, so a card that would exceed the frame shows its cut instead of clipping silently.
export const Container = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),
  minWidth: '400px',
  width: 'min-content',
  maxWidth: '800px',
  minHeight: '255px',
  height: 'fit-content',
  maxHeight: '80vh',
  overflowY: 'hidden',
  border: '1px solid',
  borderRadius: '8px',
  justifyContent: 'flex-start',
  borderColor: theme.palette.border.primary,
  boxShadow: theme.shadows[9],
}));

export const BlockContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
  paddingBottom: theme.spacing(1),
  marginBottom: theme.spacing(1),
  borderBottom: '1px solid',
  borderColor: theme.palette.border.primary,
}));

export const AboutContainer = styled(Grid)(({ theme }) => ({
  borderTop: '1px solid',
  borderTopColor: theme.palette.divider,
  paddingTop: theme.spacing(2),
}));

export const AboutText = styled(Typography)(() => ({ width: '100%' }));

// The one-line terminal state of a card ("Couldn't load details").
export const StateText = styled(Typography)(({ theme }) => ({
  color: theme.palette.texts.hint,
}));

// The visible cut of a ClampedBlock: a fade over the block's last lines and a trailing "…" row, positioned against the
// block's own container (useCollapse's clamp mode makes it `position: relative`) — never a flow sibling, which would
// land below the clip and never be seen.
export const ClampedFade = styled('div')(({ theme }) => ({
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,
  height: '40px',
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
  pointerEvents: 'none',
  background: `linear-gradient(to bottom, transparent, ${theme.palette.background.default} 70%)`,
  color: theme.palette.texts.hint,
  fontSize: theme.typography.body1.fontSize,
  lineHeight: '20px',
}));

// A term's owner line in the card: the owner's name + the title chip, as the term page's rail shows it (without the
// rail's hover-revealed edit / delete buttons — the card is not interactive).
export const OwnerRow = styled('span')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0.25, 0),
}));

export const Muted = styled('span')(({ theme }) => ({
  color: theme.palette.texts.hint,
  marginLeft: theme.spacing(0.5),
}));
