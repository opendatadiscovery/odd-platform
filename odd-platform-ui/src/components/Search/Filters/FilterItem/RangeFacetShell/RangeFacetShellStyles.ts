import { Grid } from '@mui/material';
import styled from 'styled-components';

// The preset-link row under a range facet's body. Shared by every range facet (ST-9's numeric slider, ST-10's
// date picker, ST-11's created/updated ranges) so they cannot drift apart visually.
export const Presets = styled(Grid)(({ theme }) => ({
  gap: theme.spacing(1),
  marginTop: theme.spacing(0.5),
}));
