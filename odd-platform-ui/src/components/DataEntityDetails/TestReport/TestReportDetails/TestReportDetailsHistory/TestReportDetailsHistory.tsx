import React from 'react';
import { fetchDataEntityRuns } from 'redux/thunks';
import { useAppDispatch, useAppSelector } from 'lib/redux/hooks';
import {
  getDataEntityRunList,
  getDataEntityRunsFetchingStatuses,
} from 'redux/selectors/dataEntityRun.selector';
import { useAppParams } from 'lib/hooks/hooks';
import { getQualityTestNameByTestId } from 'redux/selectors/dataQualityTest.selectors';
import { Grid, Typography } from '@mui/material';
import { format, formatDistanceStrict } from 'date-fns';
import TestRunStatusItem from 'components/shared/TestRunStatusItem/TestRunStatusItem';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import TestRunStatusReasonModal from 'components/DataEntityDetails/QualityTestRunsHistory/TestRunStatusReasonModal/TestRunStatusReasonModal';
import TestReportDetailsHistoryItemSkeleton from './TestReportDetailsHistoryItemSkeleton/TestReportDetailsHistoryItemSkeleton';
import {
  QualityTestRunItem,
  QualityTestRunItemContainer,
} from './TestReportDetailsHistoryStyles';

const TestReportDetailsHistory: React.FC = () => {
  const { dataQATestId } = useAppParams();
  const dispatch = useAppDispatch();
  const dataQATestRunsList = useAppSelector(getDataEntityRunList);
  const dataQATestName = useAppSelector(state =>
    getQualityTestNameByTestId(state, dataQATestId)
  );
  const { isLoading: testRunsFetching } = useAppSelector(
    getDataEntityRunsFetchingStatuses
  );

  React.useEffect(() => {
    dispatch(
      fetchDataEntityRuns({
        dataEntityId: dataQATestId,
        page: 1,
        size: 10,
      })
    );
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
            <QualityTestRunItemContainer container>
              <QualityTestRunItem container>
                <Typography variant="body1">
                  {dataQATestRun?.startTime &&
                    format(
                      dataQATestRun?.startTime,
                      'd MMM yyyy, HH:MM a'
                    )}
                </Typography>
                <Typography variant="body1" align="right">
                  {dataQATestRun?.startTime &&
                    dataQATestRun?.endTime &&
                    formatDistanceStrict(
                      dataQATestRun?.endTime,
                      dataQATestRun?.startTime,
                      { addSuffix: false }
                    )}
                </Typography>
                <TestRunStatusItem typeName={dataQATestRun.status} />
              </QualityTestRunItem>
            </QualityTestRunItemContainer>
          }
        />
      ))}
      {testRunsFetching && (
        <SkeletonWrapper
          length={5}
          renderContent={({ randomSkeletonPercentWidth, key }) => (
            <TestReportDetailsHistoryItemSkeleton
              width={randomSkeletonPercentWidth()}
              key={key}
            />
          )}
        />
      )}
    </Grid>
  );
};

export default TestReportDetailsHistory;
