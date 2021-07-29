import React from 'react';
import {
  DataQualityApiGetRunsRequest,
  DataQualityTestRun,
} from 'generated-sources';
import { Grid } from '@material-ui/core';
import { StylesType } from 'components/DataEntityDetails/TestReport/TestReportItem/TestReportDetails/TestReportDetailsStyles';

interface TestRunDetailsProps extends StylesType {
  testRunsList: DataQualityTestRun[];
  fetchDataSetQualityTestRuns: (
    params: DataQualityApiGetRunsRequest
  ) => void;
  dataqatestId: number;
}

const TestReportDetails: React.FC<TestRunDetailsProps> = ({
  classes,
  testRunsList,
  fetchDataSetQualityTestRuns,
  dataqatestId,
}) => {
  React.useEffect(() => {
    fetchDataSetQualityTestRuns({ dataqatestId });
  }, [fetchDataSetQualityTestRuns, dataqatestId]);
  console.log('testRunsList', testRunsList);

  return (
    <Grid container className={classes.container}>
      DETAILS
    </Grid>
  );
};

export default TestReportDetails;
