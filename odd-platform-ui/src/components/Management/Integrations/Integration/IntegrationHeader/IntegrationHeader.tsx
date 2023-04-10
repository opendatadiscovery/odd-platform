import React, { type FC } from 'react';
import type { Integration } from 'generated-sources';
import { Grid, Typography } from '@mui/material';

interface IntegrationHeaderProps {
  name: Integration['name'];
  description: Integration['description'];
}

const IntegrationHeader: FC<IntegrationHeaderProps> = ({ name, description }) => (
  <Grid>
    <Typography variant='h1'>{name}</Typography>
    <Typography variant='body1' color='texts.hint'>
      {description}
    </Typography>
  </Grid>
);

export default IntegrationHeader;
