import React from 'react';
import { Grid, Typography } from '@mui/material';

const NoMessage: React.FC = () => (
  <Grid container flexDirection='column' justifyContent='center' alignItems='center'>
    <Typography variant='h2'>Messages are not selected</Typography>
    <Typography variant='subtitle1'>Select a message to see discussions</Typography>
  </Grid>
);
export default NoMessage;
