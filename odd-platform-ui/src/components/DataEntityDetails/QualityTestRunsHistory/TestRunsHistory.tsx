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
import DataSourceSkeletonItem from 'components/Management/DataSourcesList/DataSourceSkeletonItem/DataSourceSkeletonItem';
import DataSourceItemContainer from 'components/Management/DataSourcesList/DataSourceItem/DataSourceItemContainer';
import InfiniteScroll from 'react-infinite-scroll-component';
import { CurrentPageInfo } from 'redux/interfaces';
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
  const pageSize = 3;

  const [alertStatus, setAlertStatus] = React.useState<
    DataQualityTestRunStatus | 'All'
  >('All');

  React.useEffect(() => {
    fetchDataSetQualityTestRuns({
      dataqatestId: dataQATestId,
      page: 1,
      size: pageSize,
    });
  }, [fetchDataSetQualityTestRuns, dataQATestId]);

  const filterDataQATestRunsByStatus = (
    dataQATestRun: DataQualityTestRun
  ) => {
    if (alertStatus === 'All') return true;
    return dataQATestRun.status === alertStatus;
  };

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
        {/* <InfiniteScroll */}
        {/*  next={fetchNextPage} */}
        {/*  hasMore={!!pageInfo?.hasNext} */}
        {/*  loader={ */}
        {/*    isDataSourcesListFetching ? ( */}
        {/*      <SkeletonWrapper */}
        {/*        length={5} */}
        {/*        renderContent={({ randomSkeletonPercentWidth, key }) => ( */}
        {/*          <DataSourceSkeletonItem */}
        {/*            width={randomSkeletonPercentWidth()} */}
        {/*            key={key} */}
        {/*          /> */}
        {/*        )} */}
        {/*      /> */}
        {/*    ) : null */}
        {/*  } */}
        {/*  dataLength={dataQATestRunsList.length} */}
        {/* > */}
        {/*  {dataQATestRunsList?.map(dataQATestRun => ( */}
        {/*    <TestRunItem */}
        {/*      key={dataQATestRun.id} */}
        {/*      dataQATestRun={dataQATestRun} */}
        {/*      dataQATestId={dataQATestId} */}
        {/*      dataQATestName={dataQATestName} */}
        {/*    /> */}
        {/*  ))} */}
        {/* </InfiniteScroll> */}
        {dataQATestRunsList?.map(dataQATestRun => (
          <TestRunItem
            key={dataQATestRun.id}
            dataQATestRun={dataQATestRun}
            dataQATestId={dataQATestId}
            dataQATestName={dataQATestName}
          />
        ))}
      </Grid>
      {!isTestRunsListFetching && !dataQATestRunsList?.length ? (
        <EmptyContentPlaceholder />
      ) : null}
    </Grid>
  );
};

export default TestRunsHistory;
