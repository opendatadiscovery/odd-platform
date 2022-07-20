import React from 'react';
import { Grid, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { DataEntityRunStatus } from 'generated-sources';
import { dataEntityTestReportPath } from 'lib/paths';
import { useAppSelector } from 'lib/redux/hooks';
import {
  getDatasetTestReportFetchingStatuses,
  getDatasetTestReport,
} from 'redux/selectors/dataQualityTest.selectors';
import OverviewDataQualityReportSkeleton from 'components/DataEntityDetails/Overview/OverviewDataQualityReport/OverviewDataQualityReportSkeleton/OverviewDataQualityReportSkeleton';
import AppButton from 'components/shared/AppButton/AppButton';
import {
  Bar,
  Container,
  CountLabel,
} from './OverviewDataQualityReportStyles';

interface OverviewDataQualityReportProps {
  dataEntityId: number;
}

const OverviewDataQualityReport: React.FC<
  OverviewDataQualityReportProps
> = ({ dataEntityId }) => {
  const { isLoading: isDatasetTestReportFetching } = useAppSelector(
    getDatasetTestReportFetchingStatuses
  );
  const datasetQualityTestReport = useAppSelector(state =>
    getDatasetTestReport(state, dataEntityId)
  );
  return (
    <Container>
      {isDatasetTestReportFetching ? (
        <OverviewDataQualityReportSkeleton />
      ) : (
        <Grid container direction="column">
          <Grid
            item
            container
            wrap="nowrap"
            justifyContent="space-between"
          >
            <Grid item>
              <Typography variant="h4">Test report</Typography>
            </Grid>
            <Grid item>
              <AppButton size="small" color="tertiary">
                <Link to={dataEntityTestReportPath(dataEntityId)}>
                  See all
                </Link>
              </AppButton>
            </Grid>
          </Grid>
          <Grid item container sx={{ mt: 2.75, mb: 2 }}>
            <Grid item container xs={6} alignItems="baseline">
              <Typography variant="h4" sx={{ mr: 0.5 }}>
                {datasetQualityTestReport?.total}
              </Typography>
              <Typography variant="subtitle2">tests</Typography>
            </Grid>
            <Grid item container xs={6} alignItems="baseline">
              <Typography variant="h4" sx={{ mr: 0.5 }}>
                {datasetQualityTestReport?.score}%
              </Typography>
              <Typography variant="subtitle2">score</Typography>
            </Grid>
          </Grid>
          <Grid item container>
            <Typography variant="body1" sx={{ mr: 0.5 }}>
              {datasetQualityTestReport?.successTotal}
            </Typography>
            <CountLabel
              variant="body1"
              $testRunStatus={DataEntityRunStatus.SUCCESS}
            >
              passed
            </CountLabel>
          </Grid>
          <Grid item container sx={{ mt: 0.5, mb: 0.5 }}>
            <Bar
              $testReport={datasetQualityTestReport}
              $testRunStatus={DataEntityRunStatus.SUCCESS}
            />
            <Grid item container wrap="nowrap">
              <Bar
                $testReport={datasetQualityTestReport}
                $testRunStatus={DataEntityRunStatus.FAILED}
              />
              <Bar
                $testReport={datasetQualityTestReport}
                $testRunStatus={DataEntityRunStatus.BROKEN}
              />
              <Bar
                $testReport={datasetQualityTestReport}
                $testRunStatus={DataEntityRunStatus.SKIPPED}
              />
              <Bar
                $testReport={datasetQualityTestReport}
                $testRunStatus={DataEntityRunStatus.ABORTED}
              />
              <Bar
                $testReport={datasetQualityTestReport}
                $testRunStatus={DataEntityRunStatus.UNKNOWN}
              />
            </Grid>
          </Grid>
          <Grid item container>
            <Typography variant="body1" sx={{ mr: 0.5 }}>
              {datasetQualityTestReport?.failedTotal}
            </Typography>
            <CountLabel
              variant="body1"
              $testRunStatus={DataEntityRunStatus.FAILED}
            >
              failed
            </CountLabel>
          </Grid>
          <Grid item container sx={{ mt: 0.25 }}>
            <Typography variant="body1" sx={{ mr: 0.5 }}>
              {datasetQualityTestReport?.brokenTotal}
            </Typography>
            <CountLabel
              variant="body1"
              $testRunStatus={DataEntityRunStatus.BROKEN}
            >
              broken
            </CountLabel>
          </Grid>
          <Grid item container sx={{ mt: 0.25 }}>
            <Typography variant="body1" sx={{ mr: 0.5 }}>
              {datasetQualityTestReport?.abortedTotal}
            </Typography>
            <CountLabel
              variant="body1"
              $testRunStatus={DataEntityRunStatus.ABORTED}
            >
              aborted
            </CountLabel>
          </Grid>
          <Grid item container sx={{ mt: 0.25 }}>
            <Typography variant="body1" sx={{ mr: 0.5 }}>
              {datasetQualityTestReport?.skippedTotal}
            </Typography>
            <CountLabel
              variant="body1"
              $testRunStatus={DataEntityRunStatus.SKIPPED}
            >
              skipped
            </CountLabel>
          </Grid>
          <Grid item container sx={{ mt: 0.25 }}>
            <Typography variant="body1" sx={{ mr: 0.5 }}>
              {datasetQualityTestReport?.unknownTotal}
            </Typography>
            <CountLabel
              variant="body1"
              $testRunStatus={DataEntityRunStatus.UNKNOWN}
            >
              unknown
            </CountLabel>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default OverviewDataQualityReport;
