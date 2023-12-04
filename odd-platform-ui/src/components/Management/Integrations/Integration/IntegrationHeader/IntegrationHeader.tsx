import React, { type FC } from 'react';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Button, DatasourceLogo } from 'components/shared/elements';
import type { Integration } from 'lib/interfaces';
import { managementPath } from 'routes';

interface IntegrationHeaderProps {
  id: Integration['id'];
  name: Integration['name'];
  description: Integration['description'];
}

const IntegrationHeader: FC<IntegrationHeaderProps> = ({ id, name, description }) => {
  const { t } = useTranslation();

  return (
    <Grid container justifyContent='space-between' flexWrap='nowrap'>
      <Grid container>
        <DatasourceLogo name={id} />
        <Grid sx={{ ml: 2 }}>
          <Typography variant='h1'>{name}</Typography>
          <Typography variant='body1' color='texts.hint'>
            {description}
          </Typography>
        </Grid>
      </Grid>
      <Button
        sx={{ flexShrink: 0 }}
        text={t('Back to integrations')}
        to={managementPath('integrations')}
        buttonType='secondary-m'
      />
    </Grid>
  );
};

export default IntegrationHeader;
