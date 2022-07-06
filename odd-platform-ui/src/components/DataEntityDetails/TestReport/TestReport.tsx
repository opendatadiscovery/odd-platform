import React from 'react';
import {
  DataEntityRunStatus,
  DataQualityApiGetDataEntityDataQATestsRequest,
  DataQualityApiGetDatasetTestReportRequest,
  DataQualityTest,
  DataSetTestReport,
} from 'generated-sources';
import { Grid, Typography } from '@mui/material';
import TestRunStatusItem from 'components/shared/TestRunStatusItem/TestRunStatusItem';
import TestReportItemContainer from 'components/DataEntityDetails/TestReport/TestReportItem/TestReportItemContainer';
import TestReportDetailsContainer from 'components/DataEntityDetails/TestReport/TestReportDetails/TestReportDetailsContainer';
import TestReportItemSkeleton from 'components/DataEntityDetails/TestReport/TestReportItem/TestReportItemSkeleton/TestReportItemSkeleton';
import TestReportSkeleton from 'components/DataEntityDetails/TestReport/TestReportSkeleton/TestReportSkeleton';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import { DataSetQualityTestsStatusCount } from 'redux/interfaces';
import AppPaper from 'components/shared/AppPaper/AppPaper';
import {
  TestReportContainer,
  TestReportItemCont,
} from './TestReportStyles';

interface DatasetQualityTestList {
  [suiteName: string]: DataQualityTest[];
}

interface TestReportBySuitName {
  [suiteName: string]: DataSetQualityTestsStatusCount;
}

interface TestReportProps {
  dataEntityId: number;
  dataQATestId: number;
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
  isDatasetTestListFetching: boolean;
  isDatasetTestReportFetching: boolean;
}

const TestReport: React.FC<TestReportProps> = ({
  dataEntityId,
  dataQATestId,
  datasetTestReport,
  datasetQualityTestList,
  fetchDataSetQualityTestList,
  fetchDataSetQualityTestReport,
  testReportBySuitName,
  reportDetailsViewType,
  isDatasetTestListFetching,
  isDatasetTestReportFetching,
}) => {
  React.useEffect(() => {
    fetchDataSetQualityTestReport({ dataEntityId });
    fetchDataSetQualityTestList({ dataEntityId });
  }, [fetchDataSetQualityTestReport, dataEntityId]);

  return (
    <Grid container sx={{ mt: 2 }}>
      {datasetQualityTestList ? (
        <>
          {isDatasetTestReportFetching ? (
            <SkeletonWrapper
              renderContent={({ randomSkeletonPercentWidth }) => (
                <TestReportSkeleton width={randomSkeletonPercentWidth()} />
              )}
            />
          ) : (
            <Grid container alignItems="center" wrap="nowrap">
              <TestReportContainer container item>
                <TestRunStatusItem
                  count={datasetTestReport?.successTotal}
                  typeName={DataEntityRunStatus.SUCCESS}
                />
                <TestRunStatusItem
                  count={datasetTestReport?.failedTotal}
                  typeName={DataEntityRunStatus.FAILED}
                />
                <TestRunStatusItem
                  count={datasetTestReport?.brokenTotal}
                  typeName={DataEntityRunStatus.BROKEN}
                />
                <TestRunStatusItem
                  count={datasetTestReport?.abortedTotal}
                  typeName={DataEntityRunStatus.ABORTED}
                />
                <TestRunStatusItem
                  count={datasetTestReport?.skippedTotal}
                  typeName={DataEntityRunStatus.SKIPPED}
                />
                <TestRunStatusItem
                  count={datasetTestReport?.unknownTotal}
                  typeName={DataEntityRunStatus.UNKNOWN}
                />
              </TestReportContainer>
              <Grid container item justifyContent="flex-end">
                <Typography
                  variant="body2"
                  color="textSecondary"
                >{` ${datasetTestReport?.total} tests`}</Typography>
              </Grid>
            </Grid>
          )}
          <>
            {datasetQualityTestList ? (
              <Grid container sx={{ mt: 4 }}>
                <Grid item xs={9}>
                  {isDatasetTestListFetching ? (
                    <SkeletonWrapper
                      length={5}
                      renderContent={({
                        randomSkeletonPercentWidth,
                        key,
                      }) => (
                        <TestReportItemSkeleton
                          width={randomSkeletonPercentWidth()}
                          key={key}
                        />
                      )}
                    />
                  ) : (
                    <TestReportItemCont container>
                      {Object.entries(datasetQualityTestList).map(
                        ([suitName, dataQATestList]) => (
                          <TestReportItemContainer
                            dataQATestId={dataQATestId}
                            dataSetId={dataEntityId}
                            dataQATestReport={
                              testReportBySuitName[suitName]
                            }
                            key={suitName}
                            suitName={suitName}
                            dataQATestList={dataQATestList}
                          />
                        )
                      )}
                    </TestReportItemCont>
                  )}
                </Grid>
                <Grid item xs={3}>
                  {dataQATestId ? (
                    <AppPaper square elevation={0}>
                      <TestReportDetailsContainer
                        dataEntityId={dataEntityId}
                        dataQATestId={dataQATestId}
                        reportDetailsViewType={reportDetailsViewType}
                      />
                    </AppPaper>
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
