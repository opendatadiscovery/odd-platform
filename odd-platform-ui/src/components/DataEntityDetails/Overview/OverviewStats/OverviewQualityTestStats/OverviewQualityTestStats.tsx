import React from 'react';
import { Grid, Typography } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import { Link } from 'react-router-dom';
import {
  DataEntityDetails,
  DataEntityTypeNameEnum,
  DataQualityTest,
} from 'generated-sources';
import { entries } from 'lodash';
import { dataEntityDetailsPath, dataEntityHistoryPath } from 'lib/paths';
import EntityTypeItem from 'components/shared/EntityTypeItem/EntityTypeItem';
import cx from 'classnames';
import { format, formatDistanceStrict } from 'date-fns';
import LabeledInfoItem from 'components/shared/LabeledInfoItem/LabeledInfoItem';
import AppButton2 from 'components/shared/AppButton2/AppButton2';
import { styles, StylesType } from './OverviewQualityTestStatsStyles';

interface OverviewQualityTestStatsProps extends StylesType {
  suiteName: DataEntityDetails['suiteName'];
  suiteUrl: DataEntityDetails['suiteUrl'];
  datasetsList: DataEntityDetails['datasetsList'];
  qualityTest: DataQualityTest;
}

const OverviewQualityTestStats: React.FC<OverviewQualityTestStatsProps> = ({
  classes,
  suiteName,
  suiteUrl,
  datasetsList,
  qualityTest,
}) => (
  <Grid container>
    <Grid item className={classes.typeLabel}>
      <EntityTypeItem
        typeName={DataEntityTypeNameEnum.QUALITY_TEST}
        fullName
      />
    </Grid>
    <Grid container className={classes.statsContainer}>
      <Grid item className={classes.links}>
        <Grid item container>
          <Grid item container alignItems="baseline" sx={{ mb: 1 }}>
            <Typography variant="h2" className={classes.linkCount}>
              {datasetsList?.length || 0}
            </Typography>
            <Typography variant="body2" className={classes.statLabel}>
              datasets
            </Typography>
          </Grid>
          <Grid item>
            {datasetsList?.map(dataset => (
              <AppButton2
                key={dataset.id}
                sx={{ mt: 0.25, mb: 0.25 }}
                size="medium"
                color="tertiary"
              >
                <Link to={dataEntityDetailsPath(dataset.id)}>
                  {dataset.internalName || dataset.externalName}
                </Link>
              </AppButton2>
            ))}
          </Grid>
        </Grid>
        <Grid item container className={classes.suites}>
          <Grid item container>
            <Typography variant="body2" className={classes.statLabel}>
              Suite
            </Typography>
          </Grid>
          <Grid item>
            {suiteUrl ? (
              <AppButton2
                sx={{ mt: 0.25, mb: 0.25 }}
                size="medium"
                color="tertiary"
              >
                <Link to={{ pathname: suiteUrl }} target="_blank">
                  {suiteName || suiteUrl}
                </Link>
              </AppButton2>
            ) : null}
          </Grid>
        </Grid>
      </Grid>
      <Grid item className={classes.overview}>
        <Grid item container xs={12} alignItems="baseline">
          <Typography variant="body2" className={classes.statLabel}>
            Overview
          </Typography>
        </Grid>
        <LabeledInfoItem
          inline
          label="Last start"
          labelWidth={4}
          classes={{
            value: cx(
              classes.latestRunStatus,
              qualityTest?.latestRun?.status
            ),
          }}
        >
          {qualityTest?.latestRun?.status}
        </LabeledInfoItem>
        <LabeledInfoItem inline label="Date" labelWidth={4}>
          {qualityTest?.latestRun?.startTime &&
            format(
              qualityTest?.latestRun?.startTime,
              'd MMM yyyy, HH:MM a'
            )}
        </LabeledInfoItem>
        <LabeledInfoItem inline label="Duration" labelWidth={4}>
          {qualityTest?.latestRun?.startTime &&
            qualityTest?.latestRun?.endTime &&
            formatDistanceStrict(
              qualityTest.latestRun.endTime,
              qualityTest.latestRun.startTime,
              {
                addSuffix: false,
              }
            )}
        </LabeledInfoItem>
        <LabeledInfoItem inline label="Severity" labelWidth={4}>
          null
        </LabeledInfoItem>
        <Grid container>
          <Link to={dataEntityHistoryPath(qualityTest?.id)}>
            <AppButton2 size="small" color="tertiary">
              History
            </AppButton2>
          </Link>
        </Grid>
      </Grid>
      <Grid item container direction="column">
        <Grid item>
          <Grid item container xs={12} alignItems="baseline">
            <Typography variant="body2" className={classes.statLabel}>
              Parameters
            </Typography>
          </Grid>
          <Grid container className={classes.parameters}>
            {entries(qualityTest?.expectation).map(([key, value]) => (
              <LabeledInfoItem inline key={key} label={key} labelWidth={8}>
                {value}
              </LabeledInfoItem>
            ))}
          </Grid>
        </Grid>
        <Grid item className={classes.dataQALinks}>
          <Grid item container xs={12} alignItems="baseline">
            <Typography variant="body2" className={classes.statLabel}>
              Links
            </Typography>
            <Grid container className={classes.dataQALinksList}>
              <Grid item container xs={12} wrap="nowrap">
                {qualityTest?.linkedUrlList?.map(link => (
                  <Typography variant="body1">
                    {`${link}, `}&nbsp;
                  </Typography>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item className={classes.execution}>
          <Grid item container xs={12} alignItems="baseline">
            <Typography variant="body2" className={classes.statLabel}>
              Execution
            </Typography>
            <Grid item xs={12} className={classes.executionInfo}>
              <Typography variant="body2" color="textSecondary">
                No information about test execution is available.
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  </Grid>
);

export default withStyles(styles)(OverviewQualityTestStats);
