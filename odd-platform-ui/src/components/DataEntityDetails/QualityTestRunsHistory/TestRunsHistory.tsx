import React from 'react';
import {
  DataEntityRun,
  DataEntityRunApiGetRunsRequest,
  DataEntityRunStatus,
} from 'generated-sources';
import AppMenuItem from 'components/shared/AppMenuItem/AppMenuItem';
import capitalize from 'lodash/capitalize';
import { Grid, Typography } from '@mui/material';
import EmptyContentPlaceholder from 'components/shared/EmptyContentPlaceholder/EmptyContentPlaceholder';
import AppSelect from 'components/shared/AppSelect/AppSelect';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import InfiniteScroll from 'react-infinite-scroll-component';
import { CurrentPageInfo } from 'redux/interfaces';
import TestRunSkeletonItem from 'components/DataEntityDetails/QualityTestRunsHistory/TestRunSkeletonItem/TestRunSkeletonItem';
import TestRunItem from './TestRunItem/TestRunItem';
import { ColContainer, RunsTableHeader } from './TestRunsHistoryStyles';

interface QualityTestHistoryProps {
  dataQATestId: number;
  dataQATestName?: string;
  dataQATestRunsList: DataEntityRun[];
  isTestRunsListFetching: boolean;
  fetchDataSetQualityTestRuns: (
    params: DataEntityRunApiGetRunsRequest
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
    DataEntityRunStatus | 'All'
  >('All');

  const fetchPage = (page?: number) => {
    fetchDataSetQualityTestRuns({
      dataEntityId: dataQATestId,
      page: page || pageInfo.page + 1,
      size: pageSize,
      status: alertStatus === 'All' ? undefined : alertStatus,
    });
  };

  React.useEffect(() => {
    fetchPage(1);
  }, [fetchDataSetQualityTestRuns, dataQATestId, alertStatus]);

  return (
    <Grid container sx={{ mt: 2 }}>
      <AppSelect
        isDataEntityPage
        sx={{ minWidth: '200px' }}
        fullWidth={false}
        value={alertStatus}
      >
        <AppMenuItem value="All" onClick={() => setAlertStatus('All')}>
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
            next={fetchPage}
            hasMore={!!pageInfo?.hasNext}
            loader={
              isTestRunsListFetching ? (
                <SkeletonWrapper
                  length={5}
                  renderContent={({ randomSkeletonPercentWidth, key }) => (
                    <TestRunSkeletonItem
                      width={randomSkeletonPercentWidth()}
                      key={key}
                    />
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
