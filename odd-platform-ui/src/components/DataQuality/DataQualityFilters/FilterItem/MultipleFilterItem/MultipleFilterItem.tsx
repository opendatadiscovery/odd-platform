import React from 'react';
import { Grid } from '@mui/material';

interface Props {
  autocomplete: React.ReactNode;
  options: React.ReactNode;
}

const MultipleFilterItem: React.FC<Props> = ({ autocomplete, options }) => (
  <Grid container>
    <Grid size={12}>{autocomplete}</Grid>
    <Grid display='inline-flex' sx={{ my: 0.25, mx: -0.25 }} container size={12}>
      {options}
    </Grid>
  </Grid>
);

export default MultipleFilterItem;
