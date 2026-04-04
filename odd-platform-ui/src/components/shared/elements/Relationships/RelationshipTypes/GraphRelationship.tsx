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
  <Grid container flexWrap='nowrap' columnGap={1}>
    <Grid
      container
      direction='column'
      alignItems='flex-start'
      alignContent='flex-start'
      sx={{ overflow: 'hidden' }}
      size={2}
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
      container
      alignItems='center'
      justifyContent='center'
      flex='none'
      sx={{ p: 2 }}
      size={4}
    />
    <Grid
      container
      direction='column'
      alignItems='flex-start'
      alignContent='flex-start'
      sx={{ overflow: 'hidden' }}
      size={2}
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
      container
      direction='column'
      alignItems='flex-start'
      alignContent='flex-start'
      size={2}
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
    <Grid size={2} />
  </Grid>
);
