import React from 'react';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { type ERDRelationshipDetails, type DataEntityRef } from 'generated-sources';
import { ActivityCreatedIcon, ActivityDeletedIcon } from 'components/shared/icons';
import { RelationshipDatasetInfo } from '../RelationshipDatasetInfo';
import { RelationshipIcon } from '../RelationshipIcon';

interface EntityRelationshipProps {
  targetDataEntity: DataEntityRef;
  sourceDataEntity: DataEntityRef;
  erdRelationship: ERDRelationshipDetails;
}

export const EntityRelationship: React.FC<EntityRelationshipProps> = ({
  targetDataEntity,
  sourceDataEntity,
  erdRelationship,
}) => {
  const { t } = useTranslation();

  return (
    <Grid item container flexWrap='nowrap' columnGap={1}>
      <Grid
        item
        container
        xs={2}
        direction='column'
        alignItems='flex-start'
        alignContent='flex-start'
        sx={{ overflow: 'hidden' }}
      >
        <Typography variant='h4' sx={{ mb: 2 }}>
          {t('Parent:')}
        </Typography>
        <RelationshipDatasetInfo
          dataEntityId={targetDataEntity.id}
          name={targetDataEntity.internalName || targetDataEntity.externalName || ''}
          oddrn={targetDataEntity.oddrn || ''}
        />
      </Grid>
      <Grid
        item
        container
        xs={4}
        alignItems='center'
        justifyContent='center'
        flex='none'
        sx={{ p: 2 }}
      >
        <RelationshipIcon type={erdRelationship.cardinality} />
      </Grid>
      <Grid
        item
        container
        xs={2}
        direction='column'
        alignItems='flex-start'
        alignContent='flex-start'
        sx={{ overflow: 'hidden' }}
      >
        <Typography variant='h4' sx={{ mb: 2 }}>
          {t('Child:')}
        </Typography>
        <RelationshipDatasetInfo
          dataEntityId={sourceDataEntity.id}
          name={sourceDataEntity.internalName || sourceDataEntity.externalName || ''}
          oddrn={sourceDataEntity.oddrn || ''}
        />
      </Grid>
      <Grid item container xs={2} alignItems='flex-start' alignContent='flex-start'>
        <Typography variant='h4' sx={{ mb: 2 }}>
          {t('Cardinality:')}
        </Typography>
        {(erdRelationship.cardinality ?? t('Not specified')).replaceAll('_', ' ')}
      </Grid>
      <Grid
        item
        container
        xs={2}
        direction='column'
        alignItems='flex-start'
        alignContent='flex-start'
      >
        <Typography variant='h4' sx={{ mb: 2 }}>
          {t('Is Identifying:')}
        </Typography>

        {erdRelationship.isIdentifying ? (
          <Grid container alignItems='center'>
            <ActivityCreatedIcon sx={{ mr: 1 }} />
            {t('True')}
          </Grid>
        ) : (
          <Grid container alignItems='center'>
            <ActivityDeletedIcon sx={{ mr: 1 }} />
            {t('False')}
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};
