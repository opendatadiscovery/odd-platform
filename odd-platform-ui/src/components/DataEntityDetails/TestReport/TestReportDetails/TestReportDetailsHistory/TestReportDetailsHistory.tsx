import React from 'react';
import {
  DataQualityApiGetRunsRequest,
  DataQualityTestRun,
} from 'generated-sources';
import { Grid, Typography } from '@material-ui/core';
import { formatDistanceStrict } from 'date-fns';
import LatestRunIcon from 'components/shared/LatestTestRunIcon/LatestTestRunIcon';
import { StylesType } from './TestReportDetailsHistoryStyles';

interface TestReportDetailsHistoryProps extends StylesType {
  testRunsList: DataQualityTestRun[];
  fetchDataSetQualityTestRuns: (
    params: DataQualityApiGetRunsRequest
  ) => void;
  dataqatestId: number;
}

const TestReportDetailsHistory: React.FC<TestReportDetailsHistoryProps> = ({
  classes,
  testRunsList,
  fetchDataSetQualityTestRuns,
  dataqatestId,
}) => {
  React.useEffect(() => {
    if (dataqatestId) fetchDataSetQualityTestRuns({ dataqatestId });
  }, [fetchDataSetQualityTestRuns, dataqatestId]);

  const testRunItem = (qualityTestRun: DataQualityTestRun) => (
    <Grid
      key={qualityTestRun.id}
      container
      className={classes.testRunsContainer}
    >
      <Grid item xs={2} container className={classes.testRunInfoItem}>
        {qualityTestRun.status && (
          <LatestRunIcon typeName={qualityTestRun.status} />
        )}
      </Grid>
      <Grid item xs={6} container className={classes.testRunInfoItem}>
        <Typography variant="body1">
          {qualityTestRun?.startTime &&
            qualityTestRun?.endTime &&
            formatDistanceStrict(
              qualityTestRun?.endTime,
              qualityTestRun?.startTime,
              {
                addSuffix: true,
              }
            )}
        </Typography>
      </Grid>
      <Grid item xs={4} container className={classes.testRunInfoItem}>
        <Typography variant="body1">
          {qualityTestRun.statusReason}
        </Typography>
      </Grid>
    </Grid>
  );

  return (
    <>
      <Grid container className={classes.container}>
        <Grid item xs={2} container className={classes.testRunInfoItem}>
          <Typography variant="body1" color="textSecondary">
            Status
          </Typography>
        </Grid>
        <Grid item xs={6} container className={classes.testRunInfoItem}>
          <Typography variant="body1" color="textSecondary">
            Duration
          </Typography>
        </Grid>
        <Grid item xs={4} container className={classes.testRunInfoItem}>
          <Typography variant="body1" color="textSecondary">
            Status Reason
          </Typography>
        </Grid>
      </Grid>
      <>
        {testRunsList?.map(qualityTestRun => testRunItem(qualityTestRun))}
      </>
    </>
  );
};

export default TestReportDetailsHistory;
