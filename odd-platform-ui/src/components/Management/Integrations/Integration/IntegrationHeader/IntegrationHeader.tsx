import React, { type FC } from 'react';
import { Grid, Typography } from '@mui/material';
import { IntegrationLogo } from 'components/shared/elements';
import type { Integration } from 'lib/interfaces';

interface IntegrationHeaderProps {
  id: Integration['id'];
  name: Integration['name'];
  description: Integration['description'];
}

const IntegrationHeader: FC<IntegrationHeaderProps> = ({ id, name, description }) => (
  <Grid container justifyContent='flex-start'>
    <IntegrationLogo id={id} />
    <Grid sx={{ ml: 2 }}>
      <Typography variant='h1'>{name}</Typography>
      <Typography variant='body1' color='texts.hint'>
        {description}
      </Typography>
    </Grid>
  </Grid>
);

export default IntegrationHeader;
