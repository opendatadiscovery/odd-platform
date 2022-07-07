import React from 'react';
import { DataEntityRunStatus, DataQualityTest } from 'generated-sources';
import {
  getDatasetTestListFetchingStatuses,
  getDatasetTestReportFetchingStatuses,
  getDatasetTestReport,
  getDatasetQualityTestsBySuiteNames,
  getTestReportListBySuiteName,
} from 'redux/selectors/dataQualityTest.selectors';
import { useAppDispatch, useAppSelector } from 'lib/redux/hooks';
import {
  fetchDataSetQualityTestReport,
  fetchDataSetQualityTestList,
} from 'redux/thunks';
import { useAppParams } from 'lib/hooks';

import { Grid, Typography } from '@mui/material';
import TestRunStatusItem from 'components/shared/TestRunStatusItem/TestRunStatusItem';
import TestReportItem from 'components/DataEntityDetails/TestReport/TestReportItem/TestReportItem';
import TestReportDetails from 'components/DataEntityDetails/TestReport/TestReportDetails/TestReportDetails';
import TestReportItemSkeleton from 'components/DataEntityDetails/TestReport/TestReportItem/TestReportItemSkeleton/TestReportItemSkeleton';
import TestReportSkeleton from 'components/DataEntityDetails/TestReport/TestReportSkeleton/TestReportSkeleton';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import AppPaper from 'components/shared/AppPaper/AppPaper';
import {
  TestReportContainer,
  TestReportItemCont,
} from './TestReportStyles';

interface DatasetQualityTestList {
  [suiteName: string]: DataQualityTest[];
}
const TestReport: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dataQATestId, dataEntityId, reportDetailsViewType } =
    useAppParams();
  const datasetTestReport = useAppSelector(state =>
    getDatasetTestReport(state, dataEntityId)
  );

  const datasetQualityTestList: DatasetQualityTestList = useAppSelector(
    state => getDatasetQualityTestsBySuiteNames(state, dataEntityId)
  );
  const testReportBySuitName = useAppSelector(
    getTestReportListBySuiteName
  );

  const { isLoading: isDatasetTestListFetching } = useAppSelector(
    getDatasetTestListFetchingStatuses
  );
  const { isLoading: isDatasetTestReportFetching } = useAppSelector(
    getDatasetTestReportFetchingStatuses
  );
  React.useEffect(() => {
    dispatch(fetchDataSetQualityTestReport({ dataEntityId }));
    dispatch(fetchDataSetQualityTestList({ dataEntityId }));
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
                          <TestReportItem
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
                      <TestReportDetails
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
