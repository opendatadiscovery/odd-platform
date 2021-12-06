import React from 'react';
import { Grid, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import {
  DataEntityDetails,
  DataEntityTypeNameEnum,
} from 'generated-sources';
import { dataEntityDetailsPath } from 'lib/paths';
import UpstreamIcon from 'components/shared/Icons/UpstreamIcon';
import DownstreamIcon from 'components/shared/Icons/DownstreamIcon';
import EntityTypeItem from 'components/shared/EntityTypeItem/EntityTypeItem';
import AppButton from 'components/shared/AppButton/AppButton';
import { StatIconContainer } from './OverviewTransformerStatsStyles';

interface OverviewTransformerStatsProps {
  sources: DataEntityDetails['sourceList'];
  targets: DataEntityDetails['targetList'];
  unknownSourcesCount: number;
  unknownTargetsCount: number;
}

const OverviewTransformerStats: React.FC<OverviewTransformerStatsProps> = ({
  sources,
  targets,
  unknownSourcesCount,
  unknownTargetsCount,
}) => (
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
        {sources?.map(source => (
          <AppButton
            key={source.id}
            size="medium"
            color="tertiary"
            sx={{ my: 0.25 }}
          >
            <Link to={dataEntityDetailsPath(source.id)}>
              {source.internalName || source.externalName}
            </Link>
          </AppButton>
        ))}
        {unknownSourcesCount ? (
          <Typography variant="subtitle1" sx={{ ml: 0.5 }}>
            {unknownSourcesCount} more source
            {unknownSourcesCount === 1 ? '' : 's'} unknown
          </Typography>
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
        {targets?.map(target => (
          <AppButton
            key={target.id}
            sx={{ my: 0.25 }}
            size="medium"
            color="tertiary"
          >
            <Link to={dataEntityDetailsPath(target.id)}>
              {target.internalName || target.externalName}
            </Link>
          </AppButton>
        ))}
        {unknownTargetsCount ? (
          <Typography variant="subtitle1" sx={{ ml: 0.5 }}>
            {unknownTargetsCount} more target
            {unknownTargetsCount === 1 ? '' : 's'} unknown
          </Typography>
        ) : null}
      </Grid>
    </Grid>
  </Grid>
);

export default OverviewTransformerStats;
