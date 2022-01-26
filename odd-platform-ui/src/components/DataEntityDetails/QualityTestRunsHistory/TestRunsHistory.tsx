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
import { ColContainer, RunsTableHeader } from './TestRunsHistoryStyles';
import TestRunItem from './TestRunItem/TestRunItem';

interface QualityTestHistoryProps {
  dataQATestId: number;
  dataQATestName?: string;
  dataQATestRunsList: DataQualityTestRun[];
  isTestRunsListFetching: boolean;
  fetchDataSetQualityTestRuns: (
    params: DataQualityApiGetRunsRequest
  ) => void;
}

const TestRunsHistory: React.FC<QualityTestHistoryProps> = ({
  dataQATestId,
  dataQATestName,
  dataQATestRunsList,
  isTestRunsListFetching,
  fetchDataSetQualityTestRuns,
}) => {
  React.useEffect(() => {
    fetchDataSetQualityTestRuns({
      dataqatestId: dataQATestId,
      page: 1,
      size: 10,
    });
  }, [fetchDataSetQualityTestRuns, dataQATestId]);

  const [alertStatus, setAlertStatus] = React.useState<
    DataQualityTestRunStatus | 'All'
  >('All');

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
        {dataQATestRunsList
          ?.filter(filterDataQATestRunsByStatus)
          .map(dataQATestRun => (
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
