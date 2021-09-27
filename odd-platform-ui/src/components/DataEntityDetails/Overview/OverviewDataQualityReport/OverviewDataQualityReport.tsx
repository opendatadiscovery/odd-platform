import React from 'react';
import { Typography, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import cx from 'classnames';
import {
  DataQualityApiGetDatasetTestReportRequest,
  DataSetTestReport,
  DataQualityTestRunStatusEnum,
} from 'generated-sources';
import AppButton from 'components/shared/AppButton/AppButton';
import { dataEntityTestReportPath } from 'lib/paths';
import OverviewDataQualityReportSkeleton from 'components/DataEntityDetails/Overview/OverviewDataQualityReport/OverviewDataQualityReportSkeleton/OverviewDataQualityReportSkeleton';
import { StylesType } from './OverviewDataQualityReportStyles';

interface OverviewDataQualityReportProps extends StylesType {
  isDatasetTestReportFetching: boolean;
  dataEntityId: number;
  datasetQualityTestReport?: DataSetTestReport;
  fetchDataSetQualityTestReport: (
    params: DataQualityApiGetDatasetTestReportRequest
  ) => Promise<DataSetTestReport>;
}

const OverviewDataQualityReport: React.FC<OverviewDataQualityReportProps> = ({
  classes,
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
    <div className={classes.container}>
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
              <AppButton size="small" color="tertiary" onClick={() => {}}>
                <Link to={dataEntityTestReportPath(dataEntityId)}>
                  See all
                </Link>
              </AppButton>
            </Grid>
          </Grid>
          <Grid item container className={classes.totalScore}>
            <Grid item container xs={6} alignItems="baseline">
              <Typography variant="h4" className={classes.countValue}>
                {datasetQualityTestReport?.total}
              </Typography>
              <Typography
                variant="subtitle2"
                className={classes.countLabel}
              >
                tests
              </Typography>
            </Grid>
            <Grid item container xs={6} alignItems="baseline">
              <Typography variant="h4" className={classes.countValue}>
                {datasetQualityTestReport?.score}%
              </Typography>
              <Typography
                variant="subtitle2"
                className={classes.countLabel}
              >
                score
              </Typography>
            </Grid>
          </Grid>
          <Grid item container className={classes.countContainer}>
            <Typography variant="body1" className={classes.countValue}>
              {datasetQualityTestReport?.successTotal}
            </Typography>
            <Typography
              variant="body1"
              className={cx(
                classes.countLabel,
                DataQualityTestRunStatusEnum.SUCCESS
              )}
            >
              passed
            </Typography>
          </Grid>
          <Grid item container className={classes.barsContainer}>
            <div
              className={cx(
                classes.bar,
                DataQualityTestRunStatusEnum.SUCCESS
              )}
            />
            <Grid item container wrap="nowrap">
              <div
                className={cx(
                  classes.bar,
                  DataQualityTestRunStatusEnum.FAILED
                )}
              />
              <div
                className={cx(
                  classes.bar,
                  DataQualityTestRunStatusEnum.BROKEN
                )}
              />
              <div
                className={cx(
                  classes.bar,
                  DataQualityTestRunStatusEnum.SKIPPED
                )}
              />
              <div
                className={cx(
                  classes.bar,
                  DataQualityTestRunStatusEnum.ABORTED
                )}
              />
              <div
                className={cx(
                  classes.bar,
                  DataQualityTestRunStatusEnum.UNKNOWN
                )}
              />
            </Grid>
          </Grid>
          <Grid item container className={classes.countContainer}>
            <Typography variant="body1" className={classes.countValue}>
              {datasetQualityTestReport?.failedTotal}
            </Typography>
            <Typography
              variant="body1"
              className={cx(
                classes.countLabel,
                DataQualityTestRunStatusEnum.FAILED
              )}
            >
              failed
            </Typography>
          </Grid>
          <Grid item container className={classes.countContainer}>
            <Typography variant="body1" className={classes.countValue}>
              {datasetQualityTestReport?.brokenTotal}
            </Typography>
            <Typography
              variant="body1"
              className={cx(
                classes.countLabel,
                DataQualityTestRunStatusEnum.BROKEN
              )}
            >
              broken
            </Typography>
          </Grid>
          <Grid item container className={classes.countContainer}>
            <Typography variant="body1" className={classes.countValue}>
              {datasetQualityTestReport?.abortedTotal}
            </Typography>
            <Typography
              variant="body1"
              className={cx(
                classes.countLabel,
                DataQualityTestRunStatusEnum.ABORTED
              )}
            >
              aborted
            </Typography>
          </Grid>
          <Grid item container className={classes.countContainer}>
            <Typography variant="body1" className={classes.countValue}>
              {datasetQualityTestReport?.skippedTotal}
            </Typography>
            <Typography
              variant="body1"
              className={cx(
                classes.countLabel,
                DataQualityTestRunStatusEnum.SKIPPED
              )}
            >
              skipped
            </Typography>
          </Grid>
          <Grid item container className={classes.countContainer}>
            <Typography variant="body1" className={classes.countValue}>
              {datasetQualityTestReport?.unknownTotal}
            </Typography>
            <Typography
              variant="body1"
              className={cx(
                classes.countLabel,
                DataQualityTestRunStatusEnum.UNKNOWN
              )}
            >
              unknown
            </Typography>
          </Grid>
        </Grid>
      )}
    </div>
  );
};

export default OverviewDataQualityReport;
