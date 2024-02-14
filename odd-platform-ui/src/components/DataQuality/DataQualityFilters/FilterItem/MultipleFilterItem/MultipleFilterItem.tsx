import React from 'react';
import { Grid } from '@mui/material';

type Props = {
  autocomplete: React.ReactNode;
  options: React.ReactNode;
};

const MultipleFilterItem: React.FC<Props> = ({ autocomplete, options }) => (
  <Grid container>
    <Grid item xs={12}>
      {autocomplete}
    </Grid>
    <Grid display='inline-flex' item xs={12} sx={{ my: 0.25, mx: -0.25 }} container>
      {options}
    </Grid>
  </Grid>
);

export default MultipleFilterItem;
