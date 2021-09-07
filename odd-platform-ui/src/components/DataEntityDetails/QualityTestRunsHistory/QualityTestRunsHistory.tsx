import React from 'react';
import {
  DataQualityApiGetRunsRequest,
  DataQualityTestRun,
} from 'generated-sources';
import cx from 'classnames';
import { Grid, Typography } from '@material-ui/core';
import { StylesType } from 'components/DataEntityDetails/QualityTestRunsHistory/QualityTestRunsHistoryStyles';
import EmptyContentPlaceholder from 'components/shared/EmptyContentPlaceholder/EmptyContentPlaceholder';
import QualityTestRunItem from 'components/DataEntityDetails/QualityTestRunsHistory/QualityTestRunItem/QualityTestRunItem';

interface QualityTestHistoryProps extends StylesType {
  dataqatestId: number;
  testRuns: DataQualityTestRun[];
  isTestRunsFetching: boolean;
  fetchDataSetQualityTestRuns: (
    params: DataQualityApiGetRunsRequest
  ) => void;
}

const QualityTestRunsHistory: React.FC<QualityTestHistoryProps> = ({
  classes,
  dataqatestId,
  testRuns,
  isTestRunsFetching,
  fetchDataSetQualityTestRuns,
}) => {
  React.useEffect(() => {
    fetchDataSetQualityTestRuns({ dataqatestId });
  }, [fetchDataSetQualityTestRuns, dataqatestId]);

  return (
    <Grid container className={classes.container}>
      <Grid container className={classes.runsTableHeader} wrap="nowrap">
        <Grid item className={cx(classes.col, classes.colmd)}>
          <Typography variant="caption">Start time</Typography>
        </Grid>
        <Grid item className={cx(classes.col, classes.colmd)}>
          <Typography variant="caption">Status</Typography>
        </Grid>
        <Grid item className={cx(classes.col, classes.collg)}>
          <Typography variant="caption">Status reason</Typography>
        </Grid>
        <Grid item className={cx(classes.col, classes.colsm)}>
          <Typography variant="caption">Duration</Typography>
        </Grid>
      </Grid>
      <Grid container>
        {testRuns &&
          testRuns.map(testRun => (
            <QualityTestRunItem key={testRun.id} testRun={testRun} />
          ))}
      </Grid>
      {!isTestRunsFetching && !testRuns?.length ? (
        <EmptyContentPlaceholder />
      ) : null}
    </Grid>
  );
};

export default QualityTestRunsHistory;
