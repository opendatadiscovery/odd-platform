import React from 'react';
import { Grid, Typography } from '@mui/material';
import {
  DataEntityDetails,
  DataEntityTypeNameEnum,
} from 'generated-sources';
import { dataEntityDetailsPath } from 'lib/paths';
import UpstreamIcon from 'components/shared/Icons/UpstreamIcon';
import DownstreamIcon from 'components/shared/Icons/DownstreamIcon';
import EntityTypeItem from 'components/shared/EntityTypeItem/EntityTypeItem';
import AppButton from 'components/shared/AppButton/AppButton';
import EntitiesListModal from 'components/shared/EntitiesListModal/EntitiesListModal';
import {
  StatIconContainer,
  EntityLink,
} from './OverviewTransformerStatsStyles';

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

  return (
    <Grid container>
      <Grid item xs={12} sx={{ mb: 1.25 }}>
        <EntityTypeItem
          typeName={DataEntityTypeNameEnum.TRANSFORMER}
          fullName
        />
      </Grid>
      <Grid
        item
        container
        xs={6}
        alignItems="flex-start"
        alignContent="flex-start"
      >
        <Grid item container xs={12} alignItems="baseline">
          <StatIconContainer sx={{ mr: 1 }}>
            <UpstreamIcon />
          </StatIconContainer>
          <Typography variant="h2" sx={{ mr: 0.5 }}>
            {(sources?.length || 0) + (unknownSourcesCount || 0)}
          </Typography>
          <Typography variant="body1" color="texts.hint">
            sources
          </Typography>
        </Grid>
        <Grid
          item
          container
          xs={12}
          direction="column"
          alignItems="flex-start"
          sx={{ mt: 1 }}
        >
          {sources?.slice(0, displayedEntitiesNumber).map(source => (
            <AppButton
              key={source.id}
              size="medium"
              color="tertiary"
              sx={{ my: 0.25 }}
            >
              <EntityLink to={dataEntityDetailsPath(source.id)}>
                {source.internalName || source.externalName}
              </EntityLink>
            </AppButton>
          ))}
          {unknownSourcesCount ? (
            <Typography variant="subtitle1" sx={{ ml: 0.5 }}>
              {unknownSourcesCount} more source
              {unknownSourcesCount === 1 ? '' : 's'} unknown
            </Typography>
          ) : null}
          {sources && sources?.length > displayedEntitiesNumber ? (
            <EntitiesListModal
              entities={sources}
              labelFor="Sources"
              dataEntityName={dataEntityName}
              openBtnEl={
                <AppButton
                  size="medium"
                  color="tertiary"
                  sx={{ my: 0.25 }}
                >
                  Show All
                </AppButton>
              }
            />
          ) : null}
        </Grid>
      </Grid>
      <Grid
        item
        container
        xs={6}
        alignItems="flex-start"
        alignContent="flex-start"
      >
        <Grid item container xs={12} alignItems="baseline">
          <StatIconContainer sx={{ mr: 1 }}>
            <DownstreamIcon />
          </StatIconContainer>
          <Typography variant="h2" sx={{ mr: 0.5 }}>
            {(targets?.length || 0) + (unknownTargetsCount || 0)}
          </Typography>
          <Typography variant="body1" color="texts.hint">
            targets
          </Typography>
        </Grid>
        <Grid
          item
          container
          xs={12}
          direction="column"
          alignItems="flex-start"
          sx={{ mt: 1 }}
        >
          {targets?.slice(0, displayedEntitiesNumber).map(target => (
            <AppButton
              key={target.id}
              sx={{ my: 0.25 }}
              size="medium"
              color="tertiary"
            >
              <EntityLink to={dataEntityDetailsPath(target.id)}>
                {target.internalName || target.externalName}
              </EntityLink>
            </AppButton>
          ))}
          {unknownTargetsCount ? (
            <Typography variant="subtitle1" sx={{ ml: 0.5 }}>
              {unknownTargetsCount} more target
              {unknownTargetsCount === 1 ? '' : 's'} unknown
            </Typography>
          ) : null}
          {targets && targets?.length > displayedEntitiesNumber ? (
            <EntitiesListModal
              entities={targets}
              labelFor="Targets"
              dataEntityName={dataEntityName}
              openBtnEl={
                <AppButton
                  size="medium"
                  color="tertiary"
                  sx={{ my: 0.25 }}
                >
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
