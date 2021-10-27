import React from 'react';
import { Grid, Typography } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import cx from 'classnames';
import { formatDistanceStrict } from 'date-fns';
import { values } from 'lodash';
import {
  DataQualityTestExpectation,
  DataQualityTestRunStatusEnum,
} from 'generated-sources';
import TestRunStatusIcon from 'components/shared/TestRunStatusIcon/TestRunStatusIcon';
import { styles, StylesType } from './TestitemStyles';

interface TestItemProps extends StylesType {
  className?: string;
  active: boolean;
  latestRunStatus: DataQualityTestRunStatusEnum | undefined;
  testName: string;
  testStartTime: Date | undefined;
  testEndTime: Date | undefined;
  testExpectations?: DataQualityTestExpectation;
}

const TestItem: React.FC<TestItemProps> = ({
  classes,
  className,
  active,
  latestRunStatus,
  testName,
  testStartTime,
  testEndTime,
  testExpectations,
}) => (
  <Grid
    container
    className={cx(classes.container, className, {
      [classes.active]: active,
    })}
  >
    <Grid item>
      {latestRunStatus && <TestRunStatusIcon typeName={latestRunStatus} />}
    </Grid>
    <Grid container item wrap="nowrap">
      <Grid item xs={2}>
        <Typography variant="body1">{testName}</Typography>
      </Grid>
      <Grid container item xs={9} justifyContent="center">
        <Typography variant="body1" className={classes.expectationItem}>
          {values(testExpectations).join(', ')}
        </Typography>
      </Grid>
      <Grid item container xs={2} justifyContent="flex-end">
        <Typography variant="body1">
          {testEndTime &&
            testStartTime &&
            formatDistanceStrict(testEndTime, testStartTime, {
              addSuffix: false,
            })}
        </Typography>
      </Grid>
    </Grid>
  </Grid>
);
export default withStyles(styles)(TestItem);
