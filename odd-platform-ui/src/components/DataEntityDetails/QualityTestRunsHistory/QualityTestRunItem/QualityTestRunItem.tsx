import React from 'react';
import { Grid, Typography, withStyles } from '@material-ui/core';
import { DataQualityTestRun } from 'generated-sources';
import cx from 'classnames';
import { format, formatDistanceStrict } from 'date-fns';
import TestRunStatusItem from 'components/shared/TestRunStatusItem/TestRunStatusItem';
import { styles, StylesType } from './QualityTestRunItemStyles';

interface QualityTestRunItemProps extends StylesType {
  testRun: DataQualityTestRun;
}

const QualityTestRunItem: React.FC<QualityTestRunItemProps> = ({
  classes,
  testRun,
}) => (
  <Grid container className={classes.container}>
    <Grid item className={cx(classes.col, classes.colmd)}>
      <Typography variant="body1">
        {testRun.startTime &&
          format(testRun.startTime, 'd MMM yyyy, HH:MM a')}
      </Typography>
    </Grid>
    <Grid item className={cx(classes.col, classes.colmd)}>
      <TestRunStatusItem typeName={testRun.status} />
    </Grid>
    <Grid item className={cx(classes.col, classes.collg)}>
      <Typography variant="body1">{testRun.statusReason}</Typography>
    </Grid>
    <Grid item className={cx(classes.col, classes.colsm)}>
      <Typography variant="body1">
        {testRun.endTime &&
          testRun.startTime &&
          formatDistanceStrict(testRun.endTime, testRun.startTime, {
            addSuffix: false,
          })}
      </Typography>
    </Grid>
  </Grid>
);

export default withStyles(styles)(QualityTestRunItem);
