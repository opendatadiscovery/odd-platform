import React from 'react';
import { Grid, Typography } from '@mui/material';
import { DataEntityClassNameEnum, type DataEntityDetails } from 'generated-sources';
import { EntityClassItem, GraphRelationship } from 'components/shared/elements';
import { useGetGraphRelationshipById } from 'lib/hooks/api/dataModelling/relatioships';

interface OverviewGraphRelationshipProps {
  dataEntityDetails: DataEntityDetails;
}

const OverviewGraphRelationship: React.FC<OverviewGraphRelationshipProps> = ({
  dataEntityDetails,
}) => {
  const { data: relationshipDetails } = useGetGraphRelationshipById(dataEntityDetails.id);

  return (
    <Grid container>
      <Grid sx={{ mb: 1.25 }} size={12}>
        <EntityClassItem
          entityClassName={DataEntityClassNameEnum.RELATIONSHIP}
          fullName
        />
      </Grid>
      {relationshipDetails && (
        <GraphRelationship
          targetDataEntity={relationshipDetails.targetDataEntity}
          sourceDataEntity={relationshipDetails.sourceDataEntity}
          graphRelationship={relationshipDetails.graphRelationship!}
        />
      )}
      <Grid container flexWrap='nowrap' columnGap={1} sx={{ my: 1.25 }}>
        <Grid
          container
          direction='column'
          alignItems='flex-start'
          alignContent='flex-start'
          size={6}
        >
          <Typography variant='h4' sx={{ mb: 1.25 }}>
            Attributes:
          </Typography>
          {relationshipDetails?.graphRelationship?.attributes?.map(attribute => (
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
