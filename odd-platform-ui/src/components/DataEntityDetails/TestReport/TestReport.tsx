import React from 'react';
import {
  DataQualityApiGetDataEntityDataQATestsRequest,
  DataQualityApiGetDatasetTestReportRequest,
  DataQualityTest,
  DataSetTestReport,
} from 'generated-sources';
import { Grid, Paper, Typography } from '@material-ui/core';
import TestReportTypeItem from 'components/shared/TestReportTypeItem/TestReportTypeItem';
import { StylesType } from './TestReportStyles';

interface TestReportProps extends StylesType {
  dataEntityId: number;
  datasetTestReport: DataSetTestReport;
  datasetTestReportList: DataQualityTest;
  fetchDataSetQualityTestList: (
    params: DataQualityApiGetDataEntityDataQATestsRequest
  ) => void;
  fetchDataSetQualityTestReport: (
    params: DataQualityApiGetDatasetTestReportRequest
  ) => void;
}

const TestReport: React.FC<TestReportProps> = ({
  classes,
  dataEntityId,
  datasetTestReport,
  datasetTestReportList,
  fetchDataSetQualityTestList,
  fetchDataSetQualityTestReport,
}) => {
  React.useEffect(() => {
    fetchDataSetQualityTestReport({ dataEntityId });
    fetchDataSetQualityTestList({ dataEntityId });
  }, [fetchDataSetQualityTestReport, dataEntityId]);

  return (
    <div className={classes.container}>
      <Grid container className={classes.testReportContainer}>
        <Grid container item className={classes.testReport}>
          <TestReportTypeItem
            count={datasetTestReport?.successTotal}
            typeName="passed"
            size="large"
          />
          <TestReportTypeItem
            count={datasetTestReport?.failedTotal}
            typeName="failed"
            size="large"
          />
          <TestReportTypeItem
            count={datasetTestReport?.brokenTotal}
            typeName="broken"
            size="large"
          />
          <TestReportTypeItem
            count={datasetTestReport?.abortedTotal}
            typeName="skipped"
            size="large"
          />
          <TestReportTypeItem
            count={datasetTestReport?.unknownTotal}
            typeName="unknown"
            size="large"
          />
        </Grid>
        <Grid container item className={classes.testCount}>
          <Typography
            variant="body2"
            color="textSecondary"
          >{` ${datasetTestReport?.total} tests`}</Typography>
        </Grid>
      </Grid>
      {datasetTestReportList ? (
        <Grid container spacing={2}>
          <Grid item xs={8}>
            <Paper elevation={9} className={classes.sectionContainer}>
              TEST #1
            </Paper>
            <Typography variant="h3" className={classes.sectionCaption}>
              Metadata
            </Typography>
            <Paper
              square
              elevation={0}
              className={classes.sectionContainer}
            >
              TEST #2
            </Paper>
            <Typography variant="h3" className={classes.sectionCaption}>
              About
            </Typography>
            <Paper
              square
              elevation={0}
              className={classes.sectionContainer}
            >
              TEST #3
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper
              square
              elevation={0}
              className={classes.sectionContainer}
            >
              DANNYE
            </Paper>
            <Paper
              square
              elevation={0}
              className={classes.sectionContainer}
            >
              TAGS
            </Paper>
          </Grid>
        </Grid>
      ) : null}
    </div>
  );
};
export default TestReport;
