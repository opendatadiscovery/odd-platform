import { Grid } from '@mui/material';
import styled from 'styled-components';

/**
 * THE chip of the Filters rail — one style for every selected value (the server-aggregated facets, the fixed-option
 * facets, the range facets). Before ST-11 (#1845) two byte-identical copies lived in `SelectedFilterOptionStyles`
 * and `FixedOptionsMultiFilterStyles`; this is their consolidation.
 *
 * `$excluded` renders the "not <value>" state: an outlined chip on the rail's background instead of the filled one,
 * so an exclusion reads as a different kind of statement at a glance, with the word `not` carrying the meaning for
 * a screen reader and a colour-blind reader alike.
 */
export const Chip = styled(Grid)<{ $excluded?: boolean }>(({ theme, $excluded }) => ({
  display: 'flex',
  backgroundColor: $excluded ? 'transparent' : theme.palette.backgrounds.primary,
  border: $excluded
    ? `1px solid ${theme.palette.border.secondary}`
    : '1px solid transparent',
  borderRadius: '2px',
  padding: theme.spacing(0, 0.5, 0, 0.5),
  margin: theme.spacing(0.5, 0.25, 0, 0.25),
  maxWidth: '100%',
  alignItems: 'center',
  justifyContent: 'space-between',
  '&:hover': {
    backgroundColor: $excluded
      ? theme.palette.backgrounds.tertiary
      : theme.palette.backgrounds.secondary,
  },
}));
