import React from 'react';
import {
  DataQualityApiGetRunsRequest,
  DataQualityTestRun,
} from 'generated-sources';
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

interface TestReportDetailsHistoryProps {
  dataQATestRunsList: DataQualityTestRun[];
  dataQATestId: number;
  dataQATestName: string;
  testRunsFetching: boolean;
  fetchDataSetQualityTestRuns: (
    params: DataQualityApiGetRunsRequest
  ) => void;
}

const TestReportDetailsHistory: React.FC<TestReportDetailsHistoryProps> = ({
  dataQATestRunsList,
  dataQATestId,
  dataQATestName,
  testRunsFetching,
  fetchDataSetQualityTestRuns,
}) => {
  React.useEffect(() => {
    fetchDataSetQualityTestRuns({ dataqatestId: dataQATestId });
  }, [fetchDataSetQualityTestRuns, dataQATestId]);

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
