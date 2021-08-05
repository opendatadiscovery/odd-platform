import React from 'react';
import {
  DataQualityApiGetDataEntityDataQATestsRequest,
  DataQualityApiGetDatasetTestReportRequest,
  DataQualityTest,
  DataQualityTestRunStatusEnum,
  DataSetTestReport,
} from 'generated-sources';
import { Grid, Paper, Typography } from '@material-ui/core';
import TestRunStatusItem from 'components/shared/TestRunStatusItem/TestRunStatusItem';
import TestReportItemContainer from 'components/DataEntityDetails/TestReport/TestReportItem/TestReportItemContainer';
import TestReportDetailsContainer from 'components/DataEntityDetails/TestReport/TestReportDetails/TestReportDetailsContainer';
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
  reportDetailsViewType: string;
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
  reportDetailsViewType,
}) => {
  React.useEffect(() => {
    fetchDataSetQualityTestReport({ dataEntityId });
    fetchDataSetQualityTestList({ dataEntityId });
  }, [fetchDataSetQualityTestReport, dataEntityId]);

  return (
    <Grid container className={classes.container}>
      {datasetQualityTestList ? (
        <>
          <Grid container className={classes.testReportContainer}>
            <Grid container item className={classes.testReport}>
              <TestRunStatusItem
                classes={{
                  filledContainer: classes.testStatusItem
                }}
                count={datasetTestReport?.successTotal}
                typeName={DataQualityTestRunStatusEnum.SUCCESS}
                size="large"
              />
              <TestRunStatusItem
                classes={{
                  filledContainer: classes.testStatusItem
                }}
                count={datasetTestReport?.failedTotal}
                typeName={DataQualityTestRunStatusEnum.FAILED}
                size="large"
              />
              <TestRunStatusItem
                classes={{
                  filledContainer: classes.testStatusItem
                }}
                count={datasetTestReport?.brokenTotal}
                typeName={DataQualityTestRunStatusEnum.BROKEN}
                size="large"
              />
              <TestRunStatusItem
                classes={{
                  filledContainer: classes.testStatusItem
                }}
                count={datasetTestReport?.abortedTotal}
                typeName={DataQualityTestRunStatusEnum.ABORTED}
                size="large"
              />
              <TestRunStatusItem
                classes={{
                  filledContainer: classes.testStatusItem
                }}
                count={datasetTestReport?.skippedTotal}
                typeName={DataQualityTestRunStatusEnum.SKIPPED}
                size="large"
              />
              <TestRunStatusItem
                classes={{
                  filledContainer: classes.testStatusItem
                }}
                count={datasetTestReport?.unknownTotal}
                typeName={DataQualityTestRunStatusEnum.UNKNOWN}
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
          <>
            {datasetQualityTestList ? (
              <Grid container spacing={2}>
                <Grid item xs={9}>
                  <Grid
                    container
                    className={classes.testReportItemContainer}
                  >
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
                <Grid item xs={3}>
                  {dataqatestId ? (
                    <Paper square elevation={0}>
                      <TestReportDetailsContainer
                        dataEntityId={dataEntityId}
                        dataqatestId={dataqatestId}
                        reportDetailsViewType={reportDetailsViewType}
                      />
                    </Paper>
                  ) : null}
                </Grid>
              </Grid>
            ) : null}
          </>
        </>
      ) : (
        <Typography variant="body1">There are no test reports</Typography>
      )}
    </Grid>
  );
};
export default TestReport;
