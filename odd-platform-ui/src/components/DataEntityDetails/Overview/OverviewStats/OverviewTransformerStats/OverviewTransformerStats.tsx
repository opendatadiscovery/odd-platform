import React from 'react';
import { Grid, Typography } from '@mui/material';
import { DataEntityClassNameEnum, type DataEntityDetails } from 'generated-sources';
import { UpstreamIcon, DownstreamIcon } from 'components/shared/Icons';
import { EntityClassItem, AppButton, EntitiesListModal } from 'components/shared';
import { useAppPaths } from 'lib/hooks';
import { StatIconContainer } from './OverviewTransformerStatsStyles';

interface OverviewTransformerStatsProps {
  sources: DataEntityDetails['sourceList'];
  targets: DataEntityDetails['targetList'];
  unknownSourcesCount: number;
  unknownTargetsCount: number;
  dataEntityName: string | undefined;
}

const OverviewTransformerStats: React.FC<OverviewTransformerStatsProps> = ({
  sources,
  targets,
  unknownSourcesCount,
  unknownTargetsCount,
  dataEntityName,
}) => {
  const displayedEntitiesNumber = 10;
  const { dataEntityOverviewPath } = useAppPaths();

  return (
    <Grid container>
      <Grid item xs={12} sx={{ mb: 1.25 }}>
        <EntityClassItem entityClassName={DataEntityClassNameEnum.TRANSFORMER} fullName />
      </Grid>
      <Grid item container xs={6} alignItems='flex-start' alignContent='flex-start'>
        <Grid item container xs={12} alignItems='baseline'>
          <StatIconContainer sx={{ mr: 1 }}>
            <UpstreamIcon />
          </StatIconContainer>
          <Typography variant='h2' sx={{ mr: 0.5 }}>
            {(sources?.length || 0) + (unknownSourcesCount || 0)}
          </Typography>
          <Typography variant='body1' color='texts.hint'>
            sources
          </Typography>
        </Grid>
        <Grid
          item
          container
          xs={12}
          direction='column'
          alignItems='flex-start'
          sx={{ mt: 1 }}
        >
          {sources?.slice(0, displayedEntitiesNumber).map(source => (
            <AppButton
              to={dataEntityOverviewPath(source.id)}
              key={source.id}
              size='medium'
              color='tertiary'
              sx={{ my: 0.25 }}
              truncate
            >
              {source.internalName || source.externalName}
            </AppButton>
          ))}
          {unknownSourcesCount ? (
            <Typography variant='subtitle1' sx={{ ml: 0.5 }}>
              {unknownSourcesCount} more source
              {unknownSourcesCount === 1 ? '' : 's'} unknown
            </Typography>
          ) : null}
          {sources && sources?.length > displayedEntitiesNumber ? (
            <EntitiesListModal
              entities={sources}
              labelFor='Sources'
              dataEntityName={dataEntityName}
              openBtnEl={
                <AppButton size='medium' color='tertiary' sx={{ my: 0.25 }}>
                  Show All
                </AppButton>
              }
            />
          ) : null}
        </Grid>
      </Grid>
      <Grid item container xs={6} alignItems='flex-start' alignContent='flex-start'>
        <Grid item container xs={12} alignItems='baseline'>
          <StatIconContainer sx={{ mr: 1 }}>
            <DownstreamIcon />
          </StatIconContainer>
          <Typography variant='h2' sx={{ mr: 0.5 }}>
            {(targets?.length || 0) + (unknownTargetsCount || 0)}
          </Typography>
          <Typography variant='body1' color='texts.hint'>
            targets
          </Typography>
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
            <AppButton
              to={dataEntityOverviewPath(target.id)}
              key={target.id}
              sx={{ my: 0.25 }}
              size='medium'
              color='tertiary'
              truncate
            >
              {target.internalName || target.externalName}
            </AppButton>
          ))}
          {unknownTargetsCount ? (
            <Typography variant='subtitle1' sx={{ ml: 0.5 }}>
              {unknownTargetsCount} more target
              {unknownTargetsCount === 1 ? '' : 's'} unknown
            </Typography>
          ) : null}
          {targets && targets?.length > displayedEntitiesNumber ? (
            <EntitiesListModal
              entities={targets}
              labelFor='Targets'
              dataEntityName={dataEntityName}
              openBtnEl={
                <AppButton size='medium' color='tertiary' sx={{ my: 0.25 }}>
                  Show All
                </AppButton>
              }
            />
          ) : null}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default OverviewTransformerStats;
