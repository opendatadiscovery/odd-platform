import React from 'react';
import { Grid, Typography } from '@mui/material';
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
}) => (
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
        Parent:
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
        Child:
      </Typography>
      <RelationshipDatasetInfo
        dataEntityId={sourceDataEntity.id}
        name={sourceDataEntity.internalName || sourceDataEntity.externalName || ''}
        oddrn={sourceDataEntity.oddrn || ''}
      />
    </Grid>
    <Grid item container xs={2} alignItems='flex-start' alignContent='flex-start'>
      <Typography variant='h4' sx={{ mb: 2 }}>
        Cardinality:
      </Typography>
      {(erdRelationship.cardinality ?? 'Not specified').replaceAll('_', ' ')}
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
        Is Identifying:
      </Typography>

      {erdRelationship.isIdentifying ? (
        <Grid container alignItems='center'>
          <ActivityCreatedIcon sx={{ mr: 1 }} />
          True
        </Grid>
      ) : (
        <Grid container alignItems='center'>
          <ActivityDeletedIcon sx={{ mr: 1 }} />
          False
        </Grid>
      )}
    </Grid>
  </Grid>
);
