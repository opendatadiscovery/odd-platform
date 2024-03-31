import React from 'react';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DataEntityClassNameEnum, type DataEntityDetails } from 'generated-sources';
import {
  UpstreamIcon,
  DownstreamIcon,
  ActivityCreatedIcon,
  ActivityDeletedIcon,
} from 'components/shared/icons';
import { EntityClassItem, AppTooltip } from 'components/shared/elements';
import { useGetEDRRelationshipById } from 'lib/hooks/api/dataModelling/relatioships';
import { RelationshipDatasetInfo } from 'components/shared/elements/Relationships/RelationshipDatasetInfo';
import { StatIconContainer } from '../OverviewRelationshipStatsStyles';
import { RelationshipIcon } from '../RelationshipIcon';
import * as S from '../OverviewRelationshipStatsStyles';

interface OverviewEntityRelationshipProps {
  dataEntityDetails: DataEntityDetails;
}

const OverviewEntityRelationship: React.FC<OverviewEntityRelationshipProps> = ({
  dataEntityDetails,
}) => {
  const { t } = useTranslation();
  const displayedEntitiesNumber = 10;
  const { data: relationshipDetails } = useGetEDRRelationshipById(dataEntityDetails.id);

  const sources = relationshipDetails?.erdRelationship.fieldsPairs?.map(
    ({ sourceDatasetFieldOddrn }) => ({
      name: sourceDatasetFieldOddrn.split('/').pop(),
      oddrn: sourceDatasetFieldOddrn,
    })
  );

  const targets = relationshipDetails?.erdRelationship.fieldsPairs?.map(
    ({ targetDatasetFieldOddrn }) => ({
      name: targetDatasetFieldOddrn.split('/').pop(),
      oddrn: targetDatasetFieldOddrn,
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
        <Grid item container flexWrap='nowrap' columnGap={1} sx={{ mb: 1.25 }}>
          <Grid
            item
            container
            xs={2}
            direction='column'
            alignItems='flex-start'
            alignContent='flex-start'
          >
            <Typography variant='h4' sx={{ mb: 2 }}>
              Parent:
            </Typography>
            <RelationshipDatasetInfo
              dataEntityId={relationshipDetails.targetDataEntityId}
              oddrn={relationshipDetails.targetDatasetOddrn}
            />
          </Grid>
          <Grid item container xs={4} alignItems='center' justifyContent='center'>
            <RelationshipIcon type={relationshipDetails.erdRelationship.cardinality} />
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
              Child:
            </Typography>
            <RelationshipDatasetInfo
              dataEntityId={relationshipDetails.sourceDataEntityId}
              oddrn={relationshipDetails.sourceDatasetOddrn}
            />
          </Grid>
          <Grid item container xs={2} alignItems='flex-start' alignContent='flex-start'>
            <Typography variant='h4' sx={{ mb: 2 }}>
              Cardinality:
            </Typography>
            {(relationshipDetails.erdRelationship.cardinality ?? '').replaceAll('_', ' ')}
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

            {relationshipDetails.erdRelationship.isIdentifying ? (
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

      <Grid container flexWrap='nowrap' columnGap={1}>
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
            {sources?.slice(0, displayedEntitiesNumber).map(target => (
              <AppTooltip
                key={target.oddrn}
                title={<S.Tooltip>{target.oddrn}</S.Tooltip>}
                checkForOverflow={false}
              >
                <Typography variant='h4'>{target.name}</Typography>
              </AppTooltip>
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
            {targets?.slice(0, displayedEntitiesNumber).map(target => (
              <AppTooltip
                key={target.oddrn}
                title={<S.Tooltip>{target.oddrn}</S.Tooltip>}
                checkForOverflow={false}
              >
                <Typography variant='h4'>{target.name}</Typography>
              </AppTooltip>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default OverviewEntityRelationship;
