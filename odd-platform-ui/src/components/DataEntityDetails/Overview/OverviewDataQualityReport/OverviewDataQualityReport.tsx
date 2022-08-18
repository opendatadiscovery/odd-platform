import React from 'react';
import { Grid, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { DataEntityRunStatus } from 'generated-sources';
import { useAppSelector } from 'lib/redux/hooks';
import {
  getDatasetTestReport,
  getDatasetTestReportFetchingStatuses,
} from 'redux/selectors';
import { AppButton } from 'components/shared';
import { useAppPaths } from 'lib/hooks';
import OverviewDataQualityReportSkeleton from './OverviewDataQualityReportSkeleton/OverviewDataQualityReportSkeleton';
import * as S from './OverviewDataQualityReportStyles';

interface OverviewDataQualityReportProps {
  dataEntityId: number;
}

const OverviewDataQualityReport: React.FC<
  OverviewDataQualityReportProps
> = ({ dataEntityId }) => {
  const { dataEntityTestReportPath } = useAppPaths();

  const { isLoading: isDatasetTestReportFetching } = useAppSelector(
    getDatasetTestReportFetchingStatuses
  );
  const datasetQualityTestReport = useAppSelector(state =>
    getDatasetTestReport(state, dataEntityId)
  );

  return (
    <S.Container>
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
            <S.CountLabel
              variant="body1"
              $testRunStatus={DataEntityRunStatus.SUCCESS}
            >
              passed
            </S.CountLabel>
          </Grid>
          <Grid item container sx={{ mt: 0.5, mb: 0.5 }}>
            <Grid item container wrap="nowrap">
              <S.Bar
                $testReport={datasetQualityTestReport}
                $testRunStatus={DataEntityRunStatus.SUCCESS}
              />
              <S.Bar
                $testReport={datasetQualityTestReport}
                $testRunStatus={DataEntityRunStatus.FAILED}
              />
            </Grid>
            <Grid item container wrap="nowrap">
              <S.Bar
                $testReport={datasetQualityTestReport}
                $testRunStatus={DataEntityRunStatus.BROKEN}
              />
              <S.Bar
                $testReport={datasetQualityTestReport}
                $testRunStatus={DataEntityRunStatus.SKIPPED}
              />
              <S.Bar
                $testReport={datasetQualityTestReport}
                $testRunStatus={DataEntityRunStatus.ABORTED}
              />
              <S.Bar
                $testReport={datasetQualityTestReport}
                $testRunStatus={DataEntityRunStatus.UNKNOWN}
              />
            </Grid>
          </Grid>
          <Grid item container>
            <Typography variant="body1" sx={{ mr: 0.5 }}>
              {datasetQualityTestReport?.failedTotal}
            </Typography>
            <S.CountLabel
              variant="body1"
              $testRunStatus={DataEntityRunStatus.FAILED}
            >
              failed
            </S.CountLabel>
          </Grid>
          <Grid item container sx={{ mt: 0.25 }}>
            <Typography variant="body1" sx={{ mr: 0.5 }}>
              {datasetQualityTestReport?.brokenTotal}
            </Typography>
            <S.CountLabel
              variant="body1"
              $testRunStatus={DataEntityRunStatus.BROKEN}
            >
              broken
            </S.CountLabel>
          </Grid>
          <Grid item container sx={{ mt: 0.25 }}>
            <Typography variant="body1" sx={{ mr: 0.5 }}>
              {datasetQualityTestReport?.abortedTotal}
            </Typography>
            <S.CountLabel
              variant="body1"
              $testRunStatus={DataEntityRunStatus.ABORTED}
            >
              aborted
            </S.CountLabel>
          </Grid>
          <Grid item container sx={{ mt: 0.25 }}>
            <Typography variant="body1" sx={{ mr: 0.5 }}>
              {datasetQualityTestReport?.skippedTotal}
            </Typography>
            <S.CountLabel
              variant="body1"
              $testRunStatus={DataEntityRunStatus.SKIPPED}
            >
              skipped
            </S.CountLabel>
          </Grid>
          <Grid item container sx={{ mt: 0.25 }}>
            <Typography variant="body1" sx={{ mr: 0.5 }}>
              {datasetQualityTestReport?.unknownTotal}
            </Typography>
            <S.CountLabel
              variant="body1"
              $testRunStatus={DataEntityRunStatus.UNKNOWN}
            >
              unknown
            </S.CountLabel>
          </Grid>
        </Grid>
      )}
    </S.Container>
  );
};

export default OverviewDataQualityReport;
