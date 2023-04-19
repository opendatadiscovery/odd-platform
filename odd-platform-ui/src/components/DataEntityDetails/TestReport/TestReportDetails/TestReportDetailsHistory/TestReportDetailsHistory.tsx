import React from 'react';
import { fetchDataEntityRuns } from 'redux/thunks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import {
  getDataEntityRunList,
  getDataEntityRunsFetchingStatuses,
  getQualityTestNameByTestId,
} from 'redux/selectors';
import { useAppDateTime, useAppParams } from 'lib/hooks';
import { Grid, Typography } from '@mui/material';
import { SkeletonWrapper, TestRunStatusItem } from 'components/shared/elements';
import TestRunStatusReasonModal from '../../../QualityTestRunsHistory/TestRunStatusReasonModal/TestRunStatusReasonModal';
import TestReportDetailsHistoryItemSkeleton from './TestReportDetailsHistoryItemSkeleton/TestReportDetailsHistoryItemSkeleton';
import * as S from './TestReportDetailsHistoryStyles';

const TestReportDetailsHistory: React.FC = () => {
  const { dataQATestId } = useAppParams();
  const dispatch = useAppDispatch();
  const { qualityTestRunFormattedDateTime, formatDistanceStrict } = useAppDateTime();

  const dataQATestRunsList = useAppSelector(getDataEntityRunList);
  const dataQATestName = useAppSelector(state =>
    getQualityTestNameByTestId(state, dataQATestId)
  );
  const { isLoading: testRunsFetching } = useAppSelector(
    getDataEntityRunsFetchingStatuses
  );

  React.useEffect(() => {
    dispatch(fetchDataEntityRuns({ dataEntityId: dataQATestId, page: 1, size: 10 }));
  }, [fetchDataEntityRuns, dataQATestId]);
  return (
    <Grid container sx={{ mt: 2 }}>
      {dataQATestRunsList?.map(dataQATestRun => (
        <TestRunStatusReasonModal
          key={dataQATestRun.id}
          dataQATestId={dataQATestId}
          dataQATestName={dataQATestName}
          dataQATestRun={dataQATestRun}
          btnCreateEl={
            <S.QualityTestRunItemContainer container>
              <S.QualityTestRunItem container>
                <Grid container item lg={6} justifyContent='flex-start'>
                  <Typography variant='body1'>
                    {dataQATestRun?.startTime &&
                      qualityTestRunFormattedDateTime(dataQATestRun?.startTime.getTime())}
                  </Typography>
                </Grid>
                <Grid container item lg={3} justifyContent='center'>
                  <Typography variant='body1' align='right'>
                    {dataQATestRun?.startTime &&
                      dataQATestRun?.endTime &&
                      formatDistanceStrict(
                        dataQATestRun?.endTime,
                        dataQATestRun?.startTime,
                        { addSuffix: false }
                      )}
                  </Typography>
                </Grid>
                <Grid container item lg={3} justifyContent='flex-end'>
                  <TestRunStatusItem typeName={dataQATestRun.status} />
                </Grid>
              </S.QualityTestRunItem>
            </S.QualityTestRunItemContainer>
          }
        />
      ))}
      {testRunsFetching && (
        <SkeletonWrapper
          length={5}
          renderContent={({ randWidth, key }) => (
            <TestReportDetailsHistoryItemSkeleton width={randWidth()} key={key} />
          )}
        />
      )}
    </Grid>
  );
};

export default TestReportDetailsHistory;
