import React from 'react';
import type { DataEntityRunStatus } from 'generated-sources';
import {
  getDatasetQualityTestsBySuiteNames,
  getDatasetTestListFetchingError,
  getDatasetTestListFetchingStatuses,
  getDatasetTestReport,
  getDatasetTestReportFetchingStatuses,
  getTestReportListBySuiteName,
} from 'redux/selectors';
import { fetchDataSetQualityTestList } from 'redux/thunks';
import { useAppParams } from 'lib/hooks';
import { Grid, Typography } from '@mui/material';
import { AppErrorPage, AppPaper, TestRunStatusItem } from 'components/shared/elements';
import omit from 'lodash/omit';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import TestReportItem from './TestReportItem/TestReportItem';
import TestReportDetails from './TestReportDetails/TestReportDetails';
import TestReportItemSkeleton from './TestReportItem/TestReportItemSkeleton/TestReportItemSkeleton';
import TestReportSkeleton from './TestReportSkeleton/TestReportSkeleton';
import * as S from './TestReportStyles';

const TestReport: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dataQATestId, dataEntityId } = useAppParams();

  const datasetTestReport = useAppSelector(getDatasetTestReport(dataEntityId));
  const datasetQualityTestList = useAppSelector(
    getDatasetQualityTestsBySuiteNames(dataEntityId)
  );
  const testReportBySuitName = useAppSelector(getTestReportListBySuiteName);

  const {
    isLoading: isDatasetTestListFetching,
    isNotLoaded: isDatasetTestListNotLoaded,
  } = useAppSelector(getDatasetTestListFetchingStatuses);
  const datasetTestListError = useAppSelector(getDatasetTestListFetchingError);
  const { isLoading: isTestReportFetching, isNotLoaded: isTestReportNotLoaded } =
    useAppSelector(getDatasetTestReportFetchingStatuses);

  React.useEffect(() => {
    dispatch(fetchDataSetQualityTestList({ dataEntityId }));
  }, [dataEntityId]);

  const renderTestReportItems = React.useMemo(
    () =>
      Object.entries(omit(datasetTestReport, ['score', 'total'])).map(
        ([runStatusTotal, count]) => {
          const runStatus = runStatusTotal.replace('Total', '');
          const runStatusPalette = runStatus.toUpperCase() as DataEntityRunStatus;

          return (
            <TestRunStatusItem
              key={runStatusTotal}
              count={count}
              typeName={runStatusPalette}
            />
          );
        }
      ),
    [datasetTestReport]
  );

  return (
    <Grid container sx={{ mt: 2 }}>
      <>
        {isTestReportFetching ? <TestReportSkeleton /> : null}
        {isTestReportNotLoaded ? null : (
          <Grid container alignItems='center' wrap='nowrap'>
            <S.TestReportContainer container item>
              {renderTestReportItems}
            </S.TestReportContainer>
            <Grid container item justifyContent='flex-end'>
              <Typography variant='subtitle1'>{` ${datasetTestReport?.total} tests`}</Typography>
            </Grid>
          </Grid>
        )}
        <>
          {isDatasetTestListFetching ? <TestReportItemSkeleton length={5} /> : null}
          {datasetQualityTestList ? (
            <Grid container sx={{ mt: 4 }}>
              <Grid item lg={7.91} sx={{ pr: 2 }}>
                <S.TestReportItemCont container>
                  {Object.entries(datasetQualityTestList).map(
                    ([suitName, dataQATestList]) => (
                      <TestReportItem
                        dataQATestId={dataQATestId}
                        dataSetId={dataEntityId}
                        dataQATestReport={testReportBySuitName[suitName]}
                        key={suitName}
                        suitName={suitName}
                        dataQATestList={dataQATestList}
                      />
                    )
                  )}
                </S.TestReportItemCont>
              </Grid>
              {dataQATestId ? (
                <Grid item lg={4.09}>
                  <AppPaper square elevation={0}>
                    <TestReportDetails />
                  </AppPaper>
                </Grid>
              ) : null}
            </Grid>
          ) : null}
          <AppErrorPage
            showError={isDatasetTestListNotLoaded}
            error={datasetTestListError}
            offsetTop={154}
          />
        </>
      </>
    </Grid>
  );
};
export default TestReport;
