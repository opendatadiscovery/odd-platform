import React from 'react';
import { Grid, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import {
  DataQualityApiGetDatasetTestReportRequest,
  DataQualityTestRunStatusEnum,
  DataSetTestReport,
} from 'generated-sources';
import { dataEntityTestReportPath } from 'lib/paths';
import OverviewDataQualityReportSkeleton from 'components/DataEntityDetails/Overview/OverviewDataQualityReport/OverviewDataQualityReportSkeleton/OverviewDataQualityReportSkeleton';
import AppButton from 'components/shared/AppButton/AppButton';
import {
  Bar,
  CountLabel,
  Container,
} from './OverviewDataQualityReportStyles';

interface OverviewDataQualityReportProps {
  isDatasetTestReportFetching: boolean;
  dataEntityId: number;
  datasetQualityTestReport?: DataSetTestReport;
  fetchDataSetQualityTestReport: (
    params: DataQualityApiGetDatasetTestReportRequest
  ) => Promise<DataSetTestReport>;
}

const OverviewDataQualityReport: React.FC<OverviewDataQualityReportProps> = ({
  dataEntityId,
  datasetQualityTestReport,
  fetchDataSetQualityTestReport,
  isDatasetTestReportFetching,
}) => {
  React.useEffect(() => {
    fetchDataSetQualityTestReport({
      dataEntityId,
    });
  }, []);

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
              $testRunStatus={DataQualityTestRunStatusEnum.SUCCESS}
            >
              passed
            </CountLabel>
          </Grid>
          <Grid item container sx={{ mt: 0.5, mb: 0.5 }}>
            <Bar
              $testReport={datasetQualityTestReport}
              $testRunStatus={DataQualityTestRunStatusEnum.SUCCESS}
            />
            <Grid item container wrap="nowrap">
              <Bar
                $testReport={datasetQualityTestReport}
                $testRunStatus={DataQualityTestRunStatusEnum.FAILED}
              />
              <Bar
                $testReport={datasetQualityTestReport}
                $testRunStatus={DataQualityTestRunStatusEnum.BROKEN}
              />
              <Bar
                $testReport={datasetQualityTestReport}
                $testRunStatus={DataQualityTestRunStatusEnum.SKIPPED}
              />
              <Bar
                $testReport={datasetQualityTestReport}
                $testRunStatus={DataQualityTestRunStatusEnum.ABORTED}
              />
              <Bar
                $testReport={datasetQualityTestReport}
                $testRunStatus={DataQualityTestRunStatusEnum.UNKNOWN}
              />
            </Grid>
          </Grid>
          <Grid item container>
            <Typography variant="body1" sx={{ mr: 0.5 }}>
              {datasetQualityTestReport?.failedTotal}
            </Typography>
            <CountLabel
              variant="body1"
              $testRunStatus={DataQualityTestRunStatusEnum.FAILED}
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
              $testRunStatus={DataQualityTestRunStatusEnum.BROKEN}
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
              $testRunStatus={DataQualityTestRunStatusEnum.ABORTED}
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
              $testRunStatus={DataQualityTestRunStatusEnum.SKIPPED}
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
              $testRunStatus={DataQualityTestRunStatusEnum.UNKNOWN}
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
