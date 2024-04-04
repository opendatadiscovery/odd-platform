import React from 'react';
import { Grid, Typography } from '@mui/material';
import { type GraphRelationshipDetails, type DataEntityRef } from 'generated-sources';
import { ActivityCreatedIcon, ActivityDeletedIcon } from 'components/shared/icons';
import { RelationshipDatasetInfo } from '../RelationshipDatasetInfo';

interface GraphRelationshipProps {
  targetDataEntity: DataEntityRef;
  sourceDataEntity: DataEntityRef;
  graphRelationship: GraphRelationshipDetails;
}

export const GraphRelationship: React.FC<GraphRelationshipProps> = ({
  targetDataEntity,
  sourceDataEntity,
  graphRelationship,
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
        Source:
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
    />
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
        Target:
      </Typography>
      <RelationshipDatasetInfo
        dataEntityId={sourceDataEntity.id}
        name={sourceDataEntity.internalName || sourceDataEntity.externalName || ''}
        oddrn={sourceDataEntity.oddrn || ''}
      />
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
        Is Directed:
      </Typography>

      {graphRelationship.isDirected ? (
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
    <Grid xs={2} />
  </Grid>
);
