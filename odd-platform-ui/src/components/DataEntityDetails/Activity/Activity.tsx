import React from 'react';
import { useHistory } from 'react-router-dom';
import { Grid } from '@mui/material';
import ActivityResults from './ActivityResults/ActivityResults';
import Filters from './Filters/Filters';

const Activity: React.FC = () => {
  const history = useHistory();

  return (
    <Grid container sx={{ mt: 3 }} flexWrap="nowrap">
      <Filters />
      <ActivityResults />
    </Grid>
  );
};

export default Activity;
