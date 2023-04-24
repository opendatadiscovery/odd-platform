import React, { type FC } from 'react';
import { Grid, Typography } from '@mui/material';
import { AppButton, IntegrationLogo } from 'components/shared/elements';
import type { Integration } from 'lib/interfaces';
import { useAppPaths } from 'lib/hooks';

interface IntegrationHeaderProps {
  id: Integration['id'];
  name: Integration['name'];
  description: Integration['description'];
}

const IntegrationHeader: FC<IntegrationHeaderProps> = ({ id, name, description }) => {
  const { ManagementRoutes } = useAppPaths();

  return (
    <Grid container justifyContent='space-between' flexWrap='nowrap'>
      <Grid container>
        <IntegrationLogo id={id} />
        <Grid sx={{ ml: 2 }}>
          <Typography variant='h1'>{name}</Typography>
          <Typography variant='body1' color='texts.hint'>
            {description}
          </Typography>
        </Grid>
      </Grid>
      <AppButton
        to={`../../${ManagementRoutes.integrations}`}
        size='medium'
        color='primaryLight'
        sx={{ justifySelf: 'flex-end' }}
      >
        Back to integrations
      </AppButton>
    </Grid>
  );
};

export default IntegrationHeader;
