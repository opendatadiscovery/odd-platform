import React from 'react';
import { Grid, Typography } from '@mui/material';
import { DataEntityClassNameEnum, type DataEntityDetails } from 'generated-sources';
import { ActivityCreatedIcon, ActivityDeletedIcon } from 'components/shared/icons';
import { EntityClassItem } from 'components/shared/elements';
import { useGetGraphRelationshipById } from 'lib/hooks/api/dataModelling/relatioships';
import { RelationshipDatasetInfo } from 'components/shared/elements/Relationships/RelationshipDatasetInfo';

interface OverviewGraphRelationshipProps {
  dataEntityDetails: DataEntityDetails;
}

const OverviewGraphRelationship: React.FC<OverviewGraphRelationshipProps> = ({
  dataEntityDetails,
}) => {
  const { data: relationshipDetails } = useGetGraphRelationshipById(dataEntityDetails.id);

  return (
    <Grid container>
      <Grid item xs={12} sx={{ mb: 1.25 }}>
        <EntityClassItem
          entityClassName={DataEntityClassNameEnum.RELATIONSHIP}
          fullName
        />
      </Grid>
      {relationshipDetails && (
        <Grid item container flexWrap='nowrap' columnGap={1} sx={{ mb: 1.25 }}>
          <Grid
            item
            container
            xs={6}
            direction='column'
            alignItems='flex-start'
            alignContent='flex-start'
          >
            <Typography variant='h4' sx={{ mb: 2 }}>
              Source:
            </Typography>
            <RelationshipDatasetInfo
              dataEntityId={relationshipDetails.sourceDataEntityId}
              oddrn={relationshipDetails.sourceDatasetOddrn}
            />
          </Grid>
          <Grid
            item
            container
            xs={4}
            direction='column'
            alignItems='flex-start'
            alignContent='flex-start'
          >
            <Typography variant='h4' sx={{ mb: 2 }}>
              Target:
            </Typography>
            <RelationshipDatasetInfo
              dataEntityId={relationshipDetails.targetDataEntityId}
              oddrn={relationshipDetails.targetDatasetOddrn}
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

            {relationshipDetails.graphRelationship.isDirected ? (
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
      )}
      <Grid item container flexWrap='nowrap' columnGap={1} sx={{ mb: 1.25 }}>
        <Grid
          item
          container
          xs={6}
          direction='column'
          alignItems='flex-start'
          alignContent='flex-start'
        >
          <Typography variant='h4' sx={{ mb: 1.25 }}>
            Attributes:
          </Typography>
          {relationshipDetails?.graphRelationship.attributes?.map(attribute => (
            <Grid container key={attribute.name} alignItems='center'>
              <Typography variant='body1' sx={{ mr: 1 }}>
                {attribute.name}:
              </Typography>
              <Typography variant='body1'>{attribute.value}</Typography>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default OverviewGraphRelationship;
