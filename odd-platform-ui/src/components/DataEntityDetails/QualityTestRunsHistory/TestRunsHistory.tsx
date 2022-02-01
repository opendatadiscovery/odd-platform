import React from 'react';
import {
  DataQualityApiGetRunsRequest,
  DataQualityTestRun,
  DataQualityTestRunStatus,
} from 'generated-sources';
import capitalize from 'lodash/capitalize';
import { Grid, MenuItem, Typography } from '@mui/material';
import EmptyContentPlaceholder from 'components/shared/EmptyContentPlaceholder/EmptyContentPlaceholder';
import AppTextField from 'components/shared/AppTextField/AppTextField';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import InfiniteScroll from 'react-infinite-scroll-component';
import { CurrentPageInfo } from 'redux/interfaces';
import TestRunSkeletonItem from 'components/DataEntityDetails/QualityTestRunsHistory/TestRunSkeletonItem/TestRunSkeletonItem';
import TestRunItem from './TestRunItem/TestRunItem';
import { ColContainer, RunsTableHeader } from './TestRunsHistoryStyles';

interface QualityTestHistoryProps {
  dataQATestId: number;
  dataQATestName?: string;
  dataQATestRunsList: DataQualityTestRun[];
  isTestRunsListFetching: boolean;
  fetchDataSetQualityTestRuns: (
    params: DataQualityApiGetRunsRequest
  ) => void;
  pageInfo: CurrentPageInfo;
}

const TestRunsHistory: React.FC<QualityTestHistoryProps> = ({
  dataQATestId,
  dataQATestName,
  dataQATestRunsList,
  isTestRunsListFetching,
  fetchDataSetQualityTestRuns,
  pageInfo,
}) => {
  const pageSize = 100;

  const [alertStatus, setAlertStatus] = React.useState<
    DataQualityTestRunStatus | 'All'
  >('All');

  const statusForFetchingRuns =
    alertStatus === 'All' ? undefined : alertStatus;

  React.useEffect(() => {
    fetchDataSetQualityTestRuns({
      dataqatestId: dataQATestId,
      page: 1,
      size: pageSize,
      status: statusForFetchingRuns,
    });
  }, [fetchDataSetQualityTestRuns, dataQATestId, statusForFetchingRuns]);

  const fetchNextPage = () => {
    fetchDataSetQualityTestRuns({
      dataqatestId: dataQATestId,
      page: pageInfo.page + 1,
      size: pageSize,
      status: statusForFetchingRuns,
    });
  };

  const testRunItemSkeleton = React.useMemo(
    () => (
      <SkeletonWrapper
        length={5}
        renderContent={({ randomSkeletonPercentWidth, key }) => (
          <TestRunSkeletonItem
            width={randomSkeletonPercentWidth()}
            key={key}
          />
        )}
      />
    ),
    []
  );

  return (
    <Grid container sx={{ mt: 2 }}>
      <AppTextField
        sx={{ minWidth: '200px' }}
        fullWidth={false}
        select
        value={alertStatus}
      >
        <MenuItem value="All" onClick={() => setAlertStatus('All')}>
          Show all statuses
        </MenuItem>
        {Object.keys(DataQualityTestRunStatus)?.map(option => (
          <MenuItem
            key={option}
            value={option}
            onClick={() =>
              setAlertStatus(option as DataQualityTestRunStatus)
            }
          >
            {capitalize(option)}
          </MenuItem>
        ))}
      </AppTextField>
      <RunsTableHeader container wrap="nowrap" sx={{ mt: 2 }}>
        <ColContainer item $colType="md">
          <Typography variant="caption">Start time</Typography>
        </ColContainer>
        <ColContainer item $colType="sm">
          <Typography variant="caption">Status</Typography>
        </ColContainer>
        <ColContainer item $colType="lg">
          <Typography variant="caption">Status reason</Typography>
        </ColContainer>
        <ColContainer item $colType="sm">
          <Typography variant="caption">Duration</Typography>
        </ColContainer>
      </RunsTableHeader>
      <Grid container>
        <Grid item xs={12}>
          <InfiniteScroll
            next={fetchNextPage}
            hasMore={!!pageInfo?.hasNext}
            loader={isTestRunsListFetching ? testRunItemSkeleton : null}
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
