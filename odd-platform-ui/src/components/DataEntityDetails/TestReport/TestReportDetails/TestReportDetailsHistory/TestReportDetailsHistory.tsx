import React from 'react';
import {
  DataQualityApiGetRunsRequest,
  DataQualityTestRun,
} from 'generated-sources';
import { Grid, Typography } from '@material-ui/core';
import { formatDistanceStrict, format } from 'date-fns';
import TestRunStatusItem from 'components/shared/TestRunStatusItem/TestRunStatusItem';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import TestReportDetailsHistoryItemSkeleton from './TestReportDetailsHistoryItemSkeleton/TestReportDetailsHistoryItemSkeleton';
import { StylesType } from './TestReportDetailsHistoryStyles';

interface TestReportDetailsHistoryProps extends StylesType {
  testRunsList: DataQualityTestRun[];
  dataqatestId: number;
  testRunsFetching: boolean;
  fetchDataSetQualityTestRuns: (
    params: DataQualityApiGetRunsRequest
  ) => void;
}

const TestReportDetailsHistory: React.FC<TestReportDetailsHistoryProps> = ({
  classes,
  testRunsList,
  dataqatestId,
  testRunsFetching,
  fetchDataSetQualityTestRuns,
}) => {
  React.useEffect(() => {
    if (dataqatestId) fetchDataSetQualityTestRuns({ dataqatestId });
  }, [fetchDataSetQualityTestRuns, dataqatestId]);

  return (
    <div className={classes.container}>
      {testRunsList?.map(qualityTestRun => (
        <Grid
          key={qualityTestRun.id}
          container
          className={classes.testRunItemContainer}
        >
          <Grid
            item
            xs={12}
            container
            className={classes.testRunInfoItem}
            alignItems="center"
            wrap="nowrap"
            justify="space-between"
          >
            <Typography variant="body1">
              {qualityTestRun?.startTime &&
                format(qualityTestRun?.startTime, 'd MMM yyyy, HH:MM a')}
            </Typography>
            <Typography variant="body1" align="right">
              {qualityTestRun?.startTime &&
                qualityTestRun?.endTime &&
                formatDistanceStrict(
                  qualityTestRun?.endTime,
                  qualityTestRun?.startTime,
                  { addSuffix: false }
                )}
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            container
            className={classes.testRunInfoItem}
            alignItems="center"
            wrap="nowrap"
          >
            {qualityTestRun.status && (
              <TestRunStatusItem typeName={qualityTestRun.status} />
            )}
            <Typography
              variant="subtitle1"
              className={classes.statusReason}
            >
              {qualityTestRun.statusReason}
            </Typography>
          </Grid>
        </Grid>
      ))}
      {testRunsFetching && (
        <SkeletonWrapper
          length={5}
          renderContent={({ randomSkeletonPercentWidth, key }) => (
            <TestReportDetailsHistoryItemSkeleton
              width={randomSkeletonPercentWidth()}
              key={key}
            />
          )}
        />
      )}
    </div>
  );
};

export default TestReportDetailsHistory;
