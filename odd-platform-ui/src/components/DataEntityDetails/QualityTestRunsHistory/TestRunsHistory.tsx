import React from 'react';
import { DataEntityRunStatus } from 'generated-sources';
import { fetchDataEntityRuns } from 'redux/thunks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import {
  getDataEntityRunList,
  getDataEntityRunsFetchingStatuses,
  getDataEntityRunsListPageInfo,
} from 'redux/selectors/dataEntityRun.selector';
import { useAppParams } from 'lib/hooks';
import { getQualityTestNameByTestId } from 'redux/selectors/dataQualityTest.selectors';
import AppMenuItem from 'components/shared/elements/AppMenuItem/AppMenuItem';
import capitalize from 'lodash/capitalize';
import { Grid, Typography } from '@mui/material';
import EmptyContentPlaceholder from 'components/shared/elements/EmptyContentPlaceholder/EmptyContentPlaceholder';
import AppSelect from 'components/shared/elements/AppSelect/AppSelect';
import SkeletonWrapper from 'components/shared/elements/SkeletonWrapper/SkeletonWrapper';
import InfiniteScroll from 'react-infinite-scroll-component';
import TestRunSkeletonItem from 'components/DataEntityDetails/QualityTestRunsHistory/TestRunSkeletonItem/TestRunSkeletonItem';
import TestRunItem from './TestRunItem/TestRunItem';
import { ColContainer, RunsTableHeader } from './TestRunsHistoryStyles';

const TestRunsHistory: React.FC = () => {
  const pageSize = 100;

  const [alertStatus, setAlertStatus] = React.useState<DataEntityRunStatus | 'All'>(
    'All'
  );

  const dispatch = useAppDispatch();
  const { dataEntityId: dataQATestId } = useAppParams();
  const dataQATestName = useAppSelector(state =>
    getQualityTestNameByTestId(state, dataQATestId)
  );
  const pageInfo = useAppSelector(getDataEntityRunsListPageInfo);
  const dataQATestRunsList = useAppSelector(getDataEntityRunList);
  const { isLoading: isTestRunsListFetching } = useAppSelector(
    getDataEntityRunsFetchingStatuses
  );
  const fetchPage = (page?: number) => {
    dispatch(
      fetchDataEntityRuns({
        dataEntityId: dataQATestId,
        page: page || pageInfo.page + 1,
        size: pageSize,
        status: alertStatus === 'All' ? undefined : alertStatus,
      })
    );
  };

  React.useEffect(() => {
    fetchPage(1);
  }, [fetchDataEntityRuns, dataQATestId, alertStatus]);

  return (
    <Grid container sx={{ mt: 2 }}>
      <AppSelect sx={{ minWidth: '200px' }} fullWidth={false} value={alertStatus}>
        <AppMenuItem value='All' onClick={() => setAlertStatus('All')}>
          Show all statuses
        </AppMenuItem>
        {Object.keys(DataEntityRunStatus)?.map(option => (
          <AppMenuItem
            key={option}
            value={option}
            onClick={() => setAlertStatus(option as DataEntityRunStatus)}
          >
            {capitalize(option)}
          </AppMenuItem>
        ))}
      </AppSelect>
      <RunsTableHeader container wrap='nowrap' sx={{ mt: 2 }}>
        <ColContainer item $colType='md'>
          <Typography variant='caption'>Start time</Typography>
        </ColContainer>
        <ColContainer item $colType='sm'>
          <Typography variant='caption'>Status</Typography>
        </ColContainer>
        <ColContainer item $colType='lg'>
          <Typography variant='caption'>Status reason</Typography>
        </ColContainer>
        <ColContainer item $colType='sm'>
          <Typography variant='caption'>Duration</Typography>
        </ColContainer>
      </RunsTableHeader>
      <Grid container>
        <Grid item xs={12}>
          <InfiniteScroll
            next={fetchPage}
            hasMore={!!pageInfo?.hasNext}
            loader={
              isTestRunsListFetching ? (
                <SkeletonWrapper
                  length={5}
                  renderContent={({ randWidth, key }) => (
                    <TestRunSkeletonItem width={randWidth()} key={key} />
                  )}
                />
              ) : null
            }
            dataLength={dataQATestRunsList.length}
          >
            {dataQATestRunsList?.map(dataQATestRun => (
              <TestRunItem
                key={dataQATestRun.id}
                dataQATestRun={dataQATestRun}
                dataQATestId={dataQATestId}
                dataQATestName={dataQATestName}
              />
            ))}
          </InfiniteScroll>
        </Grid>
      </Grid>
      {!isTestRunsListFetching && !dataQATestRunsList.length ? (
        <EmptyContentPlaceholder />
      ) : null}
    </Grid>
  );
};

export default TestRunsHistory;
