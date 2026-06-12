import { Grid, Typography } from '@mui/material';
import type { DataEntity } from 'generated-sources';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyContentPlaceholder } from 'components/shared/elements';
import QueryExampleDetailsLinkedEntitiesItem from './QuertExampleDetailsLinkedEntitiesItem';

interface QueryExampleDetailsLinkedEntitiesProps {
  entities: DataEntity[];
}

const QueryExampleDetailsLinkedEntities = ({
  entities,
}: QueryExampleDetailsLinkedEntitiesProps) => {
  const { t } = useTranslation();
  return (
    <Grid container>
      <Grid
        container
        sx={theme => ({
          borderBottom: `1px solid ${theme.palette.divider}`,
        })}
        wrap='nowrap'
      >
        <Grid item xs={2} pl={1}>
          <Typography variant='caption'>{t('Name')}</Typography>
        </Grid>
        <Grid item xs={4} pl={1}>
          <Typography variant='caption'>{t('Namespace')}</Typography>
        </Grid>
        <Grid item xs={2} pl={1}>
          <Typography variant='caption'>{t('Datasource')}</Typography>
        </Grid>
        <Grid item xs={2} pl={1}>
          <Typography variant='caption'>{t('Owner')}</Typography>
        </Grid>
        <Grid item xs={1} pl={1}>
          <Typography variant='caption'>{t('Created')}</Typography>
        </Grid>
        <Grid item xs={1} pl={1}>
          <Typography variant='caption'>{t('Updated')}</Typography>
        </Grid>
      </Grid>
      {entities.map(entity => (
        <QueryExampleDetailsLinkedEntitiesItem entity={entity} key={entity.id} />
      ))}
      {entities.length === 0 && <EmptyContentPlaceholder />}
    </Grid>
  );
};

export default QueryExampleDetailsLinkedEntities;
