import { Grid } from '@mui/material';
import styled from 'styled-components';

// Same chip visual as the standard SelectedFilterOption (Statuses / Tag / Owner) so a fixed-option filter
// (Asset type, Data entity type) reads identically to the server-facet filters.
export const Chip = styled(Grid)(({ theme }) => ({
  display: 'flex',
  backgroundColor: theme.palette.backgrounds.primary,
  borderRadius: '2px',
  padding: theme.spacing(0, 0.5, 0, 0.5),
  margin: theme.spacing(0.5, 0.25, 0, 0.25),
  maxWidth: '100%',
  alignItems: 'center',
  justifyContent: 'space-between',
  '&:hover': { backgroundColor: theme.palette.backgrounds.secondary },
}));
