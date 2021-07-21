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
import { styles, StylesType } from './OverviewQualityTestStatsStyles';

interface OverviewQualityTestStatsProps extends StylesType {
  suiteName: DataEntityDetails['suiteName'];
  suiteUrl: DataEntityDetails['suiteUrl'];
}

const OverviewQualityTestStats: React.FC<OverviewQualityTestStatsProps> = ({
  classes,
  suiteName,
  suiteUrl,
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
          {sources?.length || 0}
        </Typography>
        <Typography variant="body2" className={classes.statLabel}>
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
      </Grid>
    </Grid>
    <Grid item container xs={6} className={classes.statsItem}>
      <Grid item container xs={12} alignItems="baseline">
        <DownstreamIcon className={classes.statIcon} />
        <Typography variant="h2" className={classes.statCount}>
          {targets?.length || 0}
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
      </Grid>
    </Grid>
  </Grid>
);

export default withStyles(styles)(OverviewQualityTestStats);
