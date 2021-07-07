import React from 'react';
import { withStyles, Grid, Typography } from '@material-ui/core';
import { DataEntityTypeNameEnum } from 'generated-sources';
import EntityTypeItem from 'components/shared/EntityTypeItem/EntityTypeItem';
import NumberFormatted from 'components/shared/NumberFormatted/NumberFormatted';
import RowsIcon from 'components/shared/Icons/RowsIcon';
import ColumnsIcon from 'components/shared/Icons/ColumnsIcon';
import UserIcon from 'components/shared/Icons/UserIcon';
import { styles, StylesType } from './OverviewDatasetStatsStyles';

interface OverviewDatasetStatsProps extends StylesType {
  stats: {
    rowsCount: number;
    fieldsCount: number;
    consumersCount: number;
  };
}

const OverviewDatasetStats: React.FC<OverviewDatasetStatsProps> = ({
  classes,
  stats,
}) => (
  <Grid container>
    <Grid item xs={12}>
      <EntityTypeItem
        typeName={DataEntityTypeNameEnum.SET}
        fullName
        className={classes.typeLabel}
      />
    </Grid>
    <Grid item container xs={4} className={classes.statsItem}>
      <Grid item xs={12}>
        <Typography variant="h6" className={classes.statLabel}>
          Rows
        </Typography>
      </Grid>
      <Grid item container xs={12} wrap="nowrap" alignItems="center">
        <RowsIcon className={classes.statIcon} />
        <Typography variant="h2" className={classes.statValue}>
          <NumberFormatted value={stats?.rowsCount} />
        </Typography>
      </Grid>
    </Grid>
    <Grid item container xs={4} className={classes.statsItem}>
      <Grid item xs={12}>
        <Typography variant="h6" className={classes.statLabel}>
          Columns
        </Typography>
      </Grid>
      <Grid item container xs={12} wrap="nowrap" alignItems="center">
        <ColumnsIcon className={classes.statIcon} />
        <Typography variant="h2" className={classes.statValue}>
          <NumberFormatted value={stats?.fieldsCount} />
        </Typography>
      </Grid>
    </Grid>
    <Grid item container xs={4} className={classes.statsItem}>
      <Grid item xs={12}>
        <Typography variant="h6" className={classes.statLabel}>
          Used by
        </Typography>
      </Grid>
      <Grid item container xs={12} wrap="nowrap" alignItems="center">
        <UserIcon className={classes.statIcon} />
        <Typography variant="h2" className={classes.statValue}>
          <NumberFormatted value={stats?.consumersCount} />
        </Typography>
      </Grid>
    </Grid>
  </Grid>
);

export default withStyles(styles)(OverviewDatasetStats);
