import React from 'react';
import {
  DataQualityApiGetRunsRequest,
  DataQualityTestRun,
} from 'generated-sources';
import { Grid, Typography } from '@mui/material';
import EmptyContentPlaceholder from 'components/shared/EmptyContentPlaceholder/EmptyContentPlaceholder';
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
    fetchDataSetQualityTestRuns({ dataqatestId: dataQATestId });
  }, [fetchDataSetQualityTestRuns, dataQATestId]);

  return (
    <Grid container sx={{ mt: 2 }}>
      <RunsTableHeader container wrap="nowrap">
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
