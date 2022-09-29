import React from 'react';
import { Grid, Typography } from '@mui/material';
import {
  getDatasetSLAReport,
  getDatasetSLAReportFetchingStatuses,
} from 'redux/selectors';
import { AppTooltip, CopyButton } from 'components/shared';
import { InformationIcon } from 'components/shared/Icons';
import { ORDERED_SEVERITY } from 'lib/constants';
import { useAppSelector } from 'redux/lib/hooks';
import OverviewDataQualityReportSkeleton from '../OverviewDataQualityReportSkeleton/OverviewDataQualityReportSkeleton';
import * as S from './OverviewDQSLAReportStyles';

interface OverviewDQSLAReportProps {
  dataEntityId: number;
}

const OverviewDQSLAReport: React.FC<OverviewDQSLAReportProps> = ({ dataEntityId }) => {
  const { isLoading: isSLAReportFetching } = useAppSelector(
    getDatasetSLAReportFetchingStatuses
  );
  const dqSLAReport = useAppSelector(getDatasetSLAReport(dataEntityId));

  const slaBarValue = ((dqSLAReport?.success || 0) * 100) / (dqSLAReport?.total || 1);

  const slaRef = dqSLAReport.slaRef
    ? `${window.location.protocol}//${window.location.host}${dqSLAReport.slaRef}`
    : '';

  const renderSeverityWeightsBar = React.useMemo(() => {
    const totalWeights = dqSLAReport.severityWeights.reduce<number>(
      (acc, { count }) => acc + count,
      0
    );

    return [...dqSLAReport.severityWeights]
      .sort(
        (a, b) =>
          ORDERED_SEVERITY.indexOf(a.severity) - ORDERED_SEVERITY.indexOf(b.severity)
      )
      .map(
        ({ severity, count }) =>
          count > 0 && (
            <S.WeightsBar
              key={severity}
              $severity={severity}
              $total={totalWeights}
              $count={count}
            />
          )
      );
  }, [dqSLAReport.severityWeights]);

  const getSLAHint = React.useCallback(
    () => (
      <>
        <Typography variant='h4' color='texts.primary'>
          SLA represents data quality tests weight relations for dataset.
        </Typography>
        <br />
        <Typography variant='body1'>There are 3 types of tests:</Typography>
        <S.HintUList>
          <li>MINOR</li>
          <li>MAJOR</li>
          <li>CRITICAL</li>
        </S.HintUList>
        <br />
        <Typography variant='body1'>
          One minor test has weight of 1. <br />
          One major test has weight of all minor tests. <br />
          One critical test has weight of all major tests.
        </Typography>
        <br />
        <Typography variant='h4' color='texts.primary'>
          SLA colour.
        </Typography>
        <br />
        <Typography variant='body1'>There are 3 SLA colours:</Typography>
        <S.HintUList>
          <li>GREEN</li>
          <li>YELLOW</li>
          <li>RED</li>
        </S.HintUList>
        <br />
        <Typography variant='body1'>
          SLA colour is calculated by determined set of rules:
        </Typography>
        <br />
        <S.HintOList>
          <li>If at least one critical test is failed {'->'} RED</li>
          <li>If all major tests are failed {'->'} RED</li>
          <li>
            If all major tests except one are failed and all minor test are failed {'->'}{' '}
            RED
          </li>
          <li>If dataset doesn&apos;t have tests {'->'} YELLOW</li>
          <li>
            If at least one major test failed and all critical are passed {'->'} YELLOW
          </li>
          <li>
            If all minor tests are failed, majors and critical are passed {'->'} YELLOW
          </li>
          <li>If all tests are passed or some of minors are failed {'->'} GREEN</li>
        </S.HintOList>
      </>
    ),
    []
  );

  return (
    <S.Container>
      {isSLAReportFetching ? (
        <OverviewDataQualityReportSkeleton />
      ) : (
        <Grid container direction='column'>
          <Grid
            item
            container
            wrap='nowrap'
            justifyContent='space-between'
            alignItems='center'
          >
            <Grid item container alignItems='center'>
              <Typography variant='h4' sx={{ mr: 0.5 }}>
                SLA
              </Typography>
              <AppTooltip
                title={getSLAHint}
                checkForOverflow={false}
                componentsProps={{
                  tooltip: {
                    sx: {
                      minWidth: '510px !important',
                      padding: '16px !important',
                    },
                  },
                }}
              >
                <InformationIcon width={14} height={14} />
              </AppTooltip>
            </Grid>
            <Grid item>
              <CopyButton stringToCopy={slaRef} />
            </Grid>
          </Grid>
          <Grid
            container
            sx={{ mt: 1.5 }}
            justifyContent='space-between'
            flexWrap='nowrap'
            alignItems='center'
          >
            <Grid item container flexWrap='nowrap' width='fit-content'>
              <Typography variant='h3' color={`slaStatus.${dqSLAReport.slaColour}`}>
                {dqSLAReport?.success}
              </Typography>
              <Typography ml={0.25} variant='h3' color='texts.hint'>
                /{dqSLAReport?.total}
              </Typography>
            </Grid>
            <Grid sx={{ ml: 1 }} item container flexDirection='column'>
              <S.Bar
                $slaColor={dqSLAReport.slaColour}
                value={slaBarValue}
                variant='determinate'
              />
              <S.BarContainer container>{renderSeverityWeightsBar}</S.BarContainer>
            </Grid>
          </Grid>
        </Grid>
      )}
    </S.Container>
  );
};

export default OverviewDQSLAReport;
