import React from 'react';
import { Grid, Typography } from '@mui/material';
import { DataEntityClassNameEnum, type DataEntityDetails } from 'generated-sources';
import { UpstreamIcon, DownstreamIcon } from 'components/shared/icons';
import { EntityClassItem, EntityRelationship } from 'components/shared/elements';
import { useGetEDRRelationshipById } from 'lib/hooks/api/dataModelling/relatioships';
import { StatIconContainer } from '../OverviewRelationshipStatsStyles';
import RelationshipKey from '../RelationshipKey';

interface OverviewEntityRelationshipProps {
  dataEntityDetails: DataEntityDetails;
}

const OverviewEntityRelationship: React.FC<OverviewEntityRelationshipProps> = ({
  dataEntityDetails,
}) => {
  const displayedEntitiesNumber = 10;
  const { data: relationshipDetails } = useGetEDRRelationshipById(dataEntityDetails.id);

  const sources = relationshipDetails?.erdRelationship?.fieldsPairs?.map(
    ({ sourceDatasetFieldOddrn, sourceDatasetFieldId }) => ({
      name: sourceDatasetFieldOddrn.split('/').pop(),
      oddrn: sourceDatasetFieldOddrn,
      id: sourceDatasetFieldId,
    })
  );

  const targets = relationshipDetails?.erdRelationship?.fieldsPairs?.map(
    ({ targetDatasetFieldOddrn, targetDatasetFieldId }) => ({
      name: targetDatasetFieldOddrn.split('/').pop(),
      oddrn: targetDatasetFieldOddrn,
      id: targetDatasetFieldId,
    })
  );

  return (
    <Grid container>
      <Grid item xs={12} sx={{ mb: 1.25 }}>
        <EntityClassItem
          entityClassName={DataEntityClassNameEnum.RELATIONSHIP}
          fullName
        />
      </Grid>
      {relationshipDetails && (
        <>
          <EntityRelationship
            targetDataEntity={relationshipDetails.targetDataEntity}
            sourceDataEntity={relationshipDetails.sourceDataEntity}
            erdRelationship={relationshipDetails.erdRelationship!}
          />

          <Grid container flexWrap='nowrap' columnGap={1} sx={{ mt: 1.25 }}>
            <Grid item container xs={6} alignItems='flex-start' alignContent='flex-start'>
              <Grid item container xs={12} alignItems='baseline'>
                <StatIconContainer sx={{ mr: 1 }}>
                  <UpstreamIcon />
                </StatIconContainer>
                <Typography variant='h2' sx={{ mr: 0.5 }}>
                  {sources?.length || 0}
                </Typography>
                <Typography variant='h4'>Referenced Key</Typography>
              </Grid>
              <Grid
                item
                container
                xs={12}
                direction='column'
                alignItems='flex-start'
                sx={{ mt: 1 }}
              >
                {targets
                  ?.slice(0, displayedEntitiesNumber)
                  .map(target => (
                    <RelationshipKey
                      key={target.oddrn}
                      name={target.name}
                      oddrn={target.oddrn}
                      id={target.id}
                      dataentityId={relationshipDetails.targetDataEntity.id}
                    />
                  ))}
              </Grid>
            </Grid>
            <Grid item container xs={6} alignItems='flex-start' alignContent='flex-start'>
              <Grid item container xs={12} alignItems='baseline'>
                <StatIconContainer sx={{ mr: 1 }}>
                  <DownstreamIcon />
                </StatIconContainer>
                <Typography variant='h2' sx={{ mr: 0.5 }}>
                  {targets?.length || 0}
                </Typography>
                <Typography variant='h4'>Foreign Key</Typography>
              </Grid>
              <Grid
                item
                container
                xs={12}
                direction='column'
                alignItems='flex-start'
                sx={{ mt: 1 }}
              >
                {sources
                  ?.slice(0, displayedEntitiesNumber)
                  .map(source => (
                    <RelationshipKey
                      key={source.oddrn}
                      name={source.name}
                      oddrn={source.oddrn}
                      id={source.id}
                      dataentityId={relationshipDetails.sourceDataEntity.id}
                    />
                  ))}
              </Grid>
            </Grid>
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default OverviewEntityRelationship;
