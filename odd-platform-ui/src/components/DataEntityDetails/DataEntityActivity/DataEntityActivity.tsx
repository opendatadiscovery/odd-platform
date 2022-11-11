import React from 'react';
import { Grid } from '@mui/material';
import ActivityResults from './ActivityResults/ActivityResults';
import Filters from './Filters/Filters';

const DataEntityActivity: React.FC = () => (
  <Grid container sx={{ mt: 3 }} flexWrap='nowrap'>
    <Filters />
    <ActivityResults />
  </Grid>
);

export default DataEntityActivity;
