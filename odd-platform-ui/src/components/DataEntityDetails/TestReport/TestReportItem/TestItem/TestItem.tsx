import React from 'react';
import { Grid, Typography, withStyles } from '@material-ui/core';
import cx from 'classnames';
import { differenceInMilliseconds } from 'date-fns';
import { DataQualityTestRunStatusEnum } from 'generated-sources';
import { styles, StylesType } from './TestitemStyles';

interface TestItemProps extends StylesType {
  className?: string;
  latestRun: DataQualityTestRunStatusEnum | undefined;
  testName: string;
  testStartTime: Date | undefined;
  testEndTime: Date | undefined;
  // expectationParams: any;
}

const TestItem: React.FC<TestItemProps> = ({
  classes,
  className,
  latestRun,
  testName,
  testStartTime,
  testEndTime,
  // expectationParams
}) => {
  const latestRunIcon = (typeName: DataQualityTestRunStatusEnum) => (
    <div className={cx(classes.latestRunIcon, typeName)} />
  );

  return (
    <Grid container className={cx(classes.container, className)}>
      <Grid item>{latestRun && latestRunIcon(latestRun)}</Grid>
      <Grid container item wrap="nowrap">
        <Grid item xs={2}>
          <Typography variant="body1">{testName}</Typography>
        </Grid>
        <Grid container item xs={9} justify="center">
          <Typography variant="body1">
            null, null, some-value,null
          </Typography>
        </Grid>
        <Grid item container xs={2} justify="flex-end">
          <Typography variant="body1">
            {testEndTime &&
              testStartTime &&
              `${differenceInMilliseconds(testEndTime, testStartTime)} ms`}
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
};
export default withStyles(styles)(TestItem);
