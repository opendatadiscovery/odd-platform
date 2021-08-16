import React from 'react';
import { withStyles, Grid, Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';
import {
  DataEntityTypeNameEnum,
  DataEntityDetails,
} from 'generated-sources';
import { dataEntityDetailsPath } from 'lib/paths';
import UpstreamIcon from 'components/shared/Icons/UpstreamIcon';
import DownstreamIcon from 'components/shared/Icons/DownstreamIcon';
import EntityTypeItem from 'components/shared/EntityTypeItem/EntityTypeItem';
import AppButton from 'components/shared/AppButton/AppButton';
import { styles, StylesType } from './OverviewTransformerStatsStyles';

interface OverviewTransformerStatsProps extends StylesType {
  sources: DataEntityDetails['sourceList'];
  targets: DataEntityDetails['targetList'];
  unknownSourcesCount: number;
  unknownTargetsCount: number;
}

const OverviewTransformerStats: React.FC<OverviewTransformerStatsProps> = ({
  classes,
  sources,
  targets,
  unknownSourcesCount,
  unknownTargetsCount,
}) => (
  <Grid container>
    <Grid item xs={12}>
      <EntityTypeItem
        typeName={DataEntityTypeNameEnum.TRANSFORMER}
        fullName
        className={classes.typeLabel}
      />
    </Grid>
    <Grid item container xs={6} className={classes.statsItem}>
      <Grid item container xs={12} alignItems="baseline">
        <UpstreamIcon className={classes.statIcon} />
        <Typography variant="h2" className={classes.statCount}>
          {(sources?.length || 0) + (unknownSourcesCount || 0)}
        </Typography>
        <Typography variant="body1" className={classes.statLabel}>
          sources
        </Typography>
      </Grid>
      <Grid
        item
        container
        xs={12}
        direction="column"
        alignItems="flex-start"
      >
        {sources?.map(source => (
          <AppButton
            key={source.id}
            className={classes.refItem}
            size="small"
            color="tertiary"
            onClick={() => {}}
          >
            <Link to={dataEntityDetailsPath(source.id)}>
              {source.internalName || source.externalName}
            </Link>
          </AppButton>
        ))}
        {unknownSourcesCount ? 
          <Typography variant="subtitle1" className={classes.unknownCount}>
            {unknownSourcesCount} more source{unknownSourcesCount === 1 ? '' : 's'} unknown
          </Typography>
        : null}
      </Grid>
    </Grid>
    <Grid item container xs={6} className={classes.statsItem}>
      <Grid item container xs={12} alignItems="baseline">
        <DownstreamIcon className={classes.statIcon} />
        <Typography variant="h2" className={classes.statCount}>
          {(targets?.length || 0) + (unknownTargetsCount || 0)}
        </Typography>
        <Typography variant="body1" className={classes.statLabel}>
          targets
        </Typography>
      </Grid>
      <Grid
        item
        container
        xs={12}
        direction="column"
        alignItems="flex-start"
      >
        {targets?.map(target => (
          <AppButton
            key={target.id}
            className={classes.refItem}
            size="small"
            color="tertiary"
            onClick={() => {}}
          >
            <Link to={dataEntityDetailsPath(target.id)}>
              {target.internalName || target.externalName}
            </Link>
          </AppButton>
        ))}
        {unknownTargetsCount ?
          <Typography variant="subtitle1" className={classes.unknownCount}>
            {unknownTargetsCount} more target{unknownTargetsCount === 1 ? '' : 's'} unknown
          </Typography>
        : null}
      </Grid>
    </Grid>
  </Grid>
);

export default withStyles(styles)(OverviewTransformerStats);
