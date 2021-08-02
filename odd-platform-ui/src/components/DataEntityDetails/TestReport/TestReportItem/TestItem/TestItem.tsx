import React from 'react';
import { Grid, Typography, withStyles } from '@material-ui/core';
import cx from 'classnames';
import { formatDistanceStrict } from 'date-fns';
import {
  DataQualityTestExpectation,
  DataQualityTestRunStatusEnum,
} from 'generated-sources';
import LatestRunIcon from 'components/shared/LatestTestRunIcon/LatestTestRunIcon';
import { styles, StylesType } from './TestitemStyles';

interface TestItemProps extends StylesType {
  className?: string;
  latestRunStatus: DataQualityTestRunStatusEnum | undefined;
  testName: string;
  testStartTime: Date | undefined;
  testEndTime: Date | undefined;
  testExpectations?: DataQualityTestExpectation;
}

const TestItem: React.FC<TestItemProps> = ({
  classes,
  className,
  latestRunStatus,
  testName,
  testStartTime,
  testEndTime,
  testExpectations,
}) => (
  <Grid container className={cx(classes.container, className)}>
    <Grid item>
      {latestRunStatus && <LatestRunIcon typeName={latestRunStatus} />}
    </Grid>
    <Grid container item wrap="nowrap">
      <Grid item xs={2}>
        <Typography variant="body1">{testName}</Typography>
      </Grid>
      <Grid container item xs={9} justify="center">
        {testExpectations &&
          Object.entries(testExpectations).map(
            ([key, value]) =>
              value && (
                <Typography
                  key={key}
                  variant="body1"
                  className={classes.expectationItem}
                >
                  {value}
                  {', '}
                </Typography>
              )
          )}
      </Grid>
      <Grid item container xs={2} justify="flex-end">
        <Typography variant="body1">
          {testEndTime &&
            testStartTime &&
            formatDistanceStrict(testEndTime, testStartTime, {
              addSuffix: true,
            })}
        </Typography>
      </Grid>
    </Grid>
  </Grid>
);
export default withStyles(styles)(TestItem);
