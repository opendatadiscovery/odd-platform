import React from 'react';
import { Grid, Typography } from '@mui/material';
import { formatDistanceStrict } from 'date-fns';
import values from 'lodash/values';
import {
  DataEntityRunStatus,
  DataQualityTestExpectation,
} from 'generated-sources';
import TestRunStatusIcon from 'components/shared/TestRunStatusIcon/TestRunStatusIcon';
import { Container } from './TestitemStyles';

interface TestItemProps {
  active: boolean;
  latestRunStatus: DataEntityRunStatus | undefined;
  testName: string;
  testStartTime: Date | undefined;
  testEndTime: Date | undefined;
  testExpectations?: DataQualityTestExpectation;
}

const TestItem: React.FC<TestItemProps> = ({
  active,
  latestRunStatus,
  testName,
  testStartTime,
  testEndTime,
  testExpectations,
}) => (
  <Container container $active={active}>
    <Grid item>
      {latestRunStatus && <TestRunStatusIcon typeName={latestRunStatus} />}
    </Grid>
    <Grid container item wrap="nowrap">
      <Grid item xs={2}>
        <Typography variant="body1">{testName}</Typography>
      </Grid>
      <Grid container item xs={9} justifyContent="center">
        <Typography variant="body1" sx={{ mr: 0.5 }}>
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
  </Container>
);
export default TestItem;
