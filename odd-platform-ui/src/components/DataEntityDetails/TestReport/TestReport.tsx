import React from 'react';
import {
  DataQualityApiGetDataEntityDataQATestsRequest,
  DataQualityApiGetDatasetTestReportRequest,
  DataQualityTest,
  DataSetTestReport,
} from 'generated-sources';
import { Grid, Paper, Typography } from '@material-ui/core';
import TestReportTypeItem from 'components/shared/TestReportTypeItem/TestReportTypeItem';
import TestReportItemContainer from 'components/DataEntityDetails/TestReport/TestReportItem/TestReportItemContainer';
import TestRunDetailsContainer from 'components/DataEntityDetails/TestReport/TestReportItem/TestReportDetails/TestReportDetailsContainer';
import { StylesType } from './TestReportStyles';

interface DatasetQualityTestList {
  [suiteName: string]: DataQualityTest[];
}

interface TestReportBySuitName {
  [suiteName: string]: {
    success: number;
    failed: number;
    skipped: number;
    aborted: number;
    unknown: number;
  };
}

interface TestReportProps extends StylesType {
  dataEntityId: number;
  dataqatestId: number;
  datasetTestReport: DataSetTestReport;
  datasetQualityTestList: DatasetQualityTestList;
  fetchDataSetQualityTestList: (
    params: DataQualityApiGetDataEntityDataQATestsRequest
  ) => void;
  fetchDataSetQualityTestReport: (
    params: DataQualityApiGetDatasetTestReportRequest
  ) => void;
  testReportBySuitName: TestReportBySuitName;
}

const TestReport: React.FC<TestReportProps> = ({
  classes,
  dataEntityId,
  dataqatestId,
  datasetTestReport,
  datasetQualityTestList,
  fetchDataSetQualityTestList,
  fetchDataSetQualityTestReport,
  testReportBySuitName,
}) => {
  React.useEffect(() => {
    fetchDataSetQualityTestReport({ dataEntityId });
    fetchDataSetQualityTestList({ dataEntityId });
  }, [fetchDataSetQualityTestReport, dataEntityId]);

  return (
    <Grid container className={classes.container}>
      <Grid container className={classes.testReportContainer}>
        <Grid container item className={classes.testReport}>
          <TestReportTypeItem
            count={datasetTestReport?.successTotal}
            typeName="success"
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
            count={datasetTestReport?.successTotal}
            typeName="aborted"
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
      {datasetQualityTestList ? (
        <Grid container spacing={2}>
          <Grid item xs={8}>
            <Grid container className={classes.testReportItemContainer}>
              {Object.entries(datasetQualityTestList).map(
                ([suitName, dataQATestList]) => (
                  <TestReportItemContainer
                    dataqatestId={dataqatestId}
                    dataSetId={dataEntityId}
                    dataQATestReport={testReportBySuitName[suitName]}
                    key={suitName}
                    suitName={suitName}
                    dataQATestList={dataQATestList}
                  />
                )
              )}
            </Grid>
          </Grid>
          <Grid item xs={4}>
            <Paper square elevation={0}>
              <TestRunDetailsContainer dataqatestId={dataqatestId} />
            </Paper>
          </Grid>
        </Grid>
      ) : null}
    </Grid>
  );
};
export default TestReport;
