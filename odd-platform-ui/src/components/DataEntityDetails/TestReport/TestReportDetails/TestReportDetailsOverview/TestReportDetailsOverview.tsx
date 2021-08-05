import React from 'react';
import { DataQualityTest } from 'generated-sources';
import { format, formatDistanceStrict } from 'date-fns';
import { Grid, Typography } from '@material-ui/core';
import { StylesType } from './TestReportDetailsOverviewStyles';

interface TestReportDetailsOverviewProps extends StylesType {
  qualityTest: DataQualityTest;
}

const TestReportDetailsOverview: React.FC<TestReportDetailsOverviewProps> = ({
  classes,
  qualityTest,
}) => (
  <Grid className={classes.container}>
    <Grid className={classes.statContainer}>
      <Grid container className={classes.statItem}>
        <Grid item xs={4}>
          <Typography variant="body1" color="textSecondary">
            Date
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <Typography variant="body1">
            {qualityTest?.latestRun?.startTime &&
              format(
                qualityTest?.latestRun?.startTime,
                'd MMM yyyy, HH:MM a'
              )}
          </Typography>
        </Grid>
      </Grid>
      <Grid container className={classes.statItem}>
        <Grid item xs={4}>
          <Typography variant="body1" color="textSecondary">
            Duration
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <Typography variant="body1">
            {qualityTest?.latestRun?.startTime &&
              qualityTest?.latestRun.endTime &&
              formatDistanceStrict(
                qualityTest?.latestRun.endTime,
                qualityTest?.latestRun.startTime,
                {
                  addSuffix: true,
                }
              )}
          </Typography>
        </Grid>
      </Grid>
      <Grid container className={classes.statItem}>
        <Grid item xs={4}>
          <Typography variant="body1" color="textSecondary">
            Severity
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <Typography variant="body2" />
        </Grid>
      </Grid>
    </Grid>
    <Grid className={classes.paramContainer}>
      <Typography variant="h4" className={classes.statItem}>
        Parameters
      </Typography>
      {qualityTest?.expectation &&
        Object.entries(qualityTest.expectation).map(
          ([key, value]) =>
            value && (
              <Grid key={key} container>
                <Grid item xs={4} className={classes.paramName}>
                  <Typography
                    variant="body1"
                    color="textSecondary"
                    noWrap
                    title={key}
                  >
                    {key}
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1" noWrap title={value}>
                    {value}
                  </Typography>
                </Grid>
              </Grid>
            )
        )}
    </Grid>
    <Grid className={classes.paramContainer}>
      <Typography variant="h4" className={classes.statItem}>
        Links
      </Typography>
      <Grid container>
        <Grid item xs={4}>
          {qualityTest?.linkedUrlList?.map(link => (
            <Typography variant="body1">{link}</Typography>
          ))}
        </Grid>
      </Grid>
    </Grid>
    <Grid className={classes.paramContainer}>
      <Typography variant="h4" className={classes.statItem}>
        Execution
      </Typography>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="body2" color="textSecondary">
            No information about test execution is available.
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  </Grid>
);

export default TestReportDetailsOverview;
