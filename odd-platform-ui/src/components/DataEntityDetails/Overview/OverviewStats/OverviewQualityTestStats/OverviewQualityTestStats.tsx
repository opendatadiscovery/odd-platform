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
  datasetsList: DataEntityDetails['datasetsList'];
}

const OverviewQualityTestStats: React.FC<OverviewQualityTestStatsProps> = ({
  classes,
  suiteName,
  suiteUrl,
  datasetsList,
}) => (
  <Grid container>
    <Grid item xs={12}>
      <EntityTypeItem
        typeName={DataEntityTypeNameEnum.QUALITY_TEST}
        fullName
        className={classes.typeLabel}
      />
    </Grid>
    <Grid item container xs={6} className={classes.statsItem}>
      <Grid item container xs={12} alignItems="baseline">
        <Typography variant="h2" className={classes.statCount}>
          {datasetsList?.length || 0}
        </Typography>
        <Typography variant="body2" className={classes.statLabel}>
          datasets
        </Typography>
      </Grid>
      <Grid
        item
        container
        xs={12}
        direction="column"
        alignItems="flex-start"
      >
        {datasetsList?.map(dataset => (
          <AppButton
            className={classes.refItem}
            size="small"
            color="tertiary"
            onClick={() => {}}
          >
            <Link to={dataEntityDetailsPath(dataset.id)}>
              {dataset.internalName || dataset.externalName}
            </Link>
          </AppButton>
        ))}
      </Grid>
    </Grid>
    <Grid item container xs={6} className={classes.statsItem}>
      <Grid item container xs={12} alignItems="baseline">
        <Typography variant="body1" className={classes.statLabel}>
          Suite
        </Typography>
      </Grid>
      <Grid
        item
        container
        xs={12}
        direction="column"
        alignItems="flex-start"
      >
        {suiteUrl ? (
          <AppButton
            className={classes.refItem}
            size="small"
            color="tertiary"
            onClick={() => {}}
          >
            <Link to={{ pathname: suiteUrl }} target="_blank">
              {suiteName || suiteUrl}
            </Link>
          </AppButton>
        ) : null}
      </Grid>
    </Grid>
  </Grid>
);

export default withStyles(styles)(OverviewQualityTestStats);
