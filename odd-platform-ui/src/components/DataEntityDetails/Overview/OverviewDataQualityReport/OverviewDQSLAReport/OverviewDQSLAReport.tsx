import React from 'react';
import { Grid, Typography } from '@mui/material';
import {
  DataQualityTestSeverity,
  DataSetSLAReport,
} from 'generated-sources';
import { useAppSelector } from 'lib/redux/hooks';
import { getDatasetSLAReportFetchingStatuses } from 'redux/selectors';
import { AppTooltip } from 'components/shared';
import { useAppPaths } from 'lib/hooks';
import { InformationIcon } from 'components/shared/Icons';
import CopyButton from 'components/shared/CopyButton/CopyButton';
import OverviewDataQualityReportSkeleton from '../OverviewDataQualityReportSkeleton/OverviewDataQualityReportSkeleton';
import * as S from './OverviewDQSLAReportStyles';

interface OverviewDQSLAReportProps {
  dataEntityId: number;
}

const OverviewDQSLAReport: React.FC<OverviewDQSLAReportProps> = ({
  dataEntityId,
}) => {
  const { dataEntityTestReportPath } = useAppPaths();

  const { isLoading: isSLAReportFetching } = useAppSelector(
    getDatasetSLAReportFetchingStatuses
  );
  // const dqSLAReport = useAppSelector(getDatasetSLAReport(dataEntityId));
  const dqSLAReport: DataSetSLAReport = {
    total: 32,
    success: 25,
    severityWeights: [
      {
        severity: DataQualityTestSeverity.CRITICAL,
        count: 1,
      },
      {
        severity: DataQualityTestSeverity.MAJOR,
        count: 1,
      },
      {
        severity: DataQualityTestSeverity.MINOR,
        count: 1,
      },
    ],
    slaRef: 'https://google.com',
  };

  // const renderReportBar = React.useMemo(() => {
  //   const { total } = datasetQualityTestReport;
  //
  //   return Object.entries(
  //     omit(datasetQualityTestReport, ['score', 'total'])
  //   ).map(
  //     ([runStatus, count]) =>
  //       count > 0 && (
  //         <S.Bar
  //           key={runStatus}
  //           $runStatus={runStatus}
  //           $runCount={count}
  //           $total={total}
  //         />
  //       )
  //   );
  // }, [datasetQualityTestReport]);

  // const renderReportCounts = React.useMemo(
  //   () =>
  //     Object.entries(
  //       omit(datasetQualityTestReport, ['score', 'total'])
  //     ).map(([runStatusTotal, count]) => {
  //       const runStatus = runStatusTotal.replace('Total', '');
  //       const runStatusPalette =
  //         runStatus.toUpperCase() as DataEntityRunStatus;
  //
  //       return (
  //         <S.CountContainer container>
  //           <S.Count key={runStatus} $runStatus={runStatusPalette}>
  //             <NumberFormatted value={count} sx={{ fontWeight: 500 }} />
  //           </S.Count>
  //           <Typography variant="subtitle2">{runStatus}</Typography>
  //         </S.CountContainer>
  //       );
  //     }),
  //   [datasetQualityTestReport]
  // );

  const value =
    ((dqSLAReport?.success || 0) * 100) / (dqSLAReport?.total || 1);
  console.log('val', value);

  return (
    <S.Container>
      {isSLAReportFetching ? (
        <OverviewDataQualityReportSkeleton />
      ) : (
        <Grid container direction="column">
          <Grid
            item
            container
            wrap="nowrap"
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid item container alignItems="center">
              <Typography variant="h4" sx={{ mr: 0.5 }}>
                SLA
              </Typography>
              <AppTooltip
                title={() => `Something about LSA`}
                // type="dark"
                checkForOverflow={false}
              >
                <InformationIcon width={14} height={14} />
              </AppTooltip>
            </Grid>
            <Grid item>
              <CopyButton stringToCopy={dqSLAReport?.slaRef || ''} />
            </Grid>
          </Grid>
          <Grid
            container
            sx={{ mt: 1.5 }}
            justifyContent="space-between"
            flexWrap="nowrap"
          >
            <Grid item container flexWrap="nowrap" width="fit-content">
              <Typography variant="h3" color="runStatus.SUCCESS.color">
                {dqSLAReport?.success}
              </Typography>
              <Typography ml={0.25} variant="h3" color="texts.hint">
                /{dqSLAReport?.total}
              </Typography>
            </Grid>
            <Grid sx={{ ml: 1 }} item container flexDirection="column">
              <S.Bar
                $slaStatus={undefined}
                value={value}
                variant="determinate"
              />
              <Grid>second bar</Grid>
            </Grid>
            {/*  <Typography variant="subtitle1"> */}
            {/*    {datasetQualityTestReport?.total} tests */}
            {/*  </Typography> */}
            {/* </Grid> */}
            {/* <S.BarContainer container>{renderReportBar}</S.BarContainer> */}
            {/* <Grid */}
            {/*  container */}
            {/*  justifyContent="space-between" */}
            {/*  flexWrap="nowrap" */}
            {/*  sx={{ mt: 1 }} */}
            {/* > */}
            {/*  {renderReportCounts} */}
          </Grid>
        </Grid>
      )}
    </S.Container>
  );
};

export default OverviewDQSLAReport;
