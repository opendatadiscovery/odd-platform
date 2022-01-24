import React from 'react';
import { Grid, Typography } from '@mui/material';
import TestReportDetailsOverviewSkeleton from 'components/DataEntityDetails/TestReport/TestReportDetails/TestReportDetailsOverview/TestReportDetailsOverviewSkeleton/TestReportDetailsOverviewSkeleton';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import { format, formatDistanceStrict } from 'date-fns';
import { DataQualityTest } from 'generated-sources';
import LabeledInfoItem from 'components/shared/LabeledInfoItem/LabeledInfoItem';

interface TestReportDetailsOverviewProps {
  qualityTest: DataQualityTest;
  isDatasetTestListFetching: boolean;
}

const TestReportDetailsOverview: React.FC<TestReportDetailsOverviewProps> = ({
  qualityTest,
  isDatasetTestListFetching,
}) => (
  <Grid container direction="column">
    {isDatasetTestListFetching ? (
      <SkeletonWrapper
        renderContent={({ randomSkeletonPercentWidth }) => (
          <TestReportDetailsOverviewSkeleton
            width={randomSkeletonPercentWidth()}
          />
        )}
      />
    ) : (
      <>
        <Grid sx={{ mt: 2 }}>
          <LabeledInfoItem label="Date" inline labelWidth={4}>
            {qualityTest?.latestRun?.startTime &&
              format(
                qualityTest?.latestRun?.startTime,
                'd MMM yyyy, HH:MM a'
              )}
          </LabeledInfoItem>
          <LabeledInfoItem label="Duration" inline labelWidth={4}>
            {qualityTest?.latestRun?.startTime &&
              qualityTest?.latestRun.endTime &&
              formatDistanceStrict(
                qualityTest?.latestRun.endTime,
                qualityTest?.latestRun.startTime,
                {
                  addSuffix: false,
                }
              )}
          </LabeledInfoItem>
          <LabeledInfoItem label="Severity" inline labelWidth={4} />
        </Grid>
        <Grid sx={{ mt: 2 }}>
          {qualityTest?.expectation &&
            Object.entries(qualityTest.expectation).map(
              ([key, value]) =>
                value && (
                  <LabeledInfoItem
                    key={key}
                    label={key}
                    inline
                    labelWidth={4}
                  >
                    {value}
                  </LabeledInfoItem>
                )
            )}
        </Grid>
        <Grid sx={{ mt: 2 }}>
          <Typography variant="h4">Links</Typography>
          <Grid container item xs={4} sx={{ mt: 1 }}>
            {qualityTest?.linkedUrlList?.map(link => (
              <Typography variant="body1">{link}</Typography>
            ))}
          </Grid>
        </Grid>
        <Grid sx={{ mt: 2 }}>
          <Typography variant="h4">Execution</Typography>
          <Grid container item xs={12} sx={{ mt: 1 }}>
            <Typography variant="body2" color="texts.secondary">
              No information about test execution is available.
            </Typography>
          </Grid>
        </Grid>
      </>
    )}
  </Grid>
);

export default TestReportDetailsOverview;
