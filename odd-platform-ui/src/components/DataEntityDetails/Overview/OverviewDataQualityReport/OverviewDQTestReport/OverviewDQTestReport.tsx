import React from 'react';
import { Grid, Typography } from '@mui/material';
import { type DataEntityRunStatus } from 'generated-sources';
import {
  getDatasetTestReport,
  getDatasetTestReportFetchingStatuses,
} from 'redux/selectors';
import { Button, NumberFormatted } from 'components/shared/elements';
import { useAppPaths } from 'lib/hooks';
import omit from 'lodash/omit';
import { useAppSelector } from 'redux/lib/hooks';
import OverviewDQReportSkeleton from './OverviewDQReportSkeleton/OverviewDQReportSkeleton';
import * as S from './OverviewDQTestReportStyles';

interface OverviewDQTestReportProps {
  dataEntityId: number;
}

const OverviewDQTestReport: React.FC<OverviewDQTestReportProps> = ({ dataEntityId }) => {
  const { dataEntityTestReportPath } = useAppPaths();

  const { isLoading: isDatasetTestReportFetching } = useAppSelector(
    getDatasetTestReportFetchingStatuses
  );
  const datasetQualityTestReport = useAppSelector(getDatasetTestReport(dataEntityId));

  const renderReportBar = React.useMemo(() => {
    const { total } = datasetQualityTestReport;

    return Object.entries(omit(datasetQualityTestReport, ['score', 'total'])).map(
      ([runStatus, count]) =>
        count > 0 && (
          <S.Bar
            key={runStatus}
            $runStatus={runStatus}
            $runCount={count}
            $total={total}
          />
        )
    );
  }, [datasetQualityTestReport]);

  const renderReportCounts = React.useMemo(
    () =>
      Object.entries(omit(datasetQualityTestReport, ['score', 'total'])).map(
        ([runStatusTotal, count]) => {
          const runStatus = runStatusTotal.replace('Total', '');
          const runStatusPalette = runStatus.toUpperCase() as DataEntityRunStatus;

          return (
            <S.CountContainer key={runStatusTotal} container>
              <S.Count key={runStatus} $runStatus={runStatusPalette}>
                <NumberFormatted value={count} sx={{ fontWeight: 500 }} />
              </S.Count>
              <Typography variant='subtitle2'>{runStatus}</Typography>
            </S.CountContainer>
          );
        }
      ),
    [datasetQualityTestReport]
  );

  return (
    <S.Container>
      {isDatasetTestReportFetching ? (
        <OverviewDQReportSkeleton />
      ) : (
        <Grid container direction='column'>
          <Grid item container wrap='nowrap' justifyContent='space-between'>
            <Grid item>
              <Typography variant='h4'>Test report</Typography>
            </Grid>
            <Grid item>
              <Button
                text='See all'
                to={dataEntityTestReportPath(dataEntityId)}
                buttonType='tertiary-m'
              />
            </Grid>
          </Grid>
          <Grid item container sx={{ mt: 1.25 }} justifyContent='space-between'>
            <Typography variant='h4'>{datasetQualityTestReport?.score}% score</Typography>
            <Typography variant='subtitle1'>
              {datasetQualityTestReport?.total} tests
            </Typography>
          </Grid>
          <S.BarContainer container>{renderReportBar}</S.BarContainer>
          <Grid container justifyContent='space-between' flexWrap='nowrap' sx={{ mt: 1 }}>
            {renderReportCounts}
          </Grid>
        </Grid>
      )}
    </S.Container>
  );
};

export default OverviewDQTestReport;
