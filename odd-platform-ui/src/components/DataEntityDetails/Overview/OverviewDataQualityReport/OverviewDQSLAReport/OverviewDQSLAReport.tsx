import React from 'react';
import { Grid, Typography } from '@mui/material';
import {
  getDatasetSLAReport,
  getDatasetSLAReportFetchingStatuses,
} from 'redux/selectors';
import { AppTooltip, CopyButton } from 'components/shared/elements';
import { InformationIcon } from 'components/shared/icons';
import { ORDERED_SEVERITY } from 'lib/constants';
import { useAppSelector } from 'redux/lib/hooks';
import { SLAColour } from 'generated-sources';
import { createUrl } from 'lib/helpers';
import { useTranslation } from 'react-i18next';
import OverviewDQSLAReportSkeleton from './OverviewDQSLAReportSkeleton/OverviewDQSLAReportSkeleton';
import * as S from './OverviewDQSLAReportStyles';

interface OverviewDQSLAReportProps {
  dataEntityId: number;
}

const OverviewDQSLAReport: React.FC<OverviewDQSLAReportProps> = ({ dataEntityId }) => {
  const { t } = useTranslation();
  const { isLoading: isSLAReportFetching, isNotLoaded: isSLAReportNotFetched } =
    useAppSelector(getDatasetSLAReportFetchingStatuses);
  const dqSLAReport = useAppSelector(getDatasetSLAReport(dataEntityId));

  const slaBarValue = ((dqSLAReport?.success || 0) * 100) / (dqSLAReport?.total || 1);

  const slaRef = createUrl(dqSLAReport?.slaRef);

  const renderSeverityWeightsBar = React.useMemo(() => {
    const totalWeights = dqSLAReport?.severityWeights.reduce<number>(
      (acc, { count }) => acc + count,
      0
    );

    return [...(dqSLAReport?.severityWeights || [])]
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
  }, [dqSLAReport?.severityWeights]);

  const SLAHint = React.useMemo(() => {
    const orderedLiElement = (text: string, color: SLAColour) => {
      if (color === 'GREEN') {
        return (
          <li>
            {text}
            <div>
              <S.SLARect $color={color} /> {color}
            </div>
          </li>
        );
      }

      return (
        <li>
          {text}
          <S.SLARect $color={color} /> {color}
        </li>
      );
    };

    return (
      <>
        <S.HintHeader variant='h4'>
          {t('SLA represents data quality tests weight relations for dataset')}
        </S.HintHeader>
        <S.HintText variant='body1' mt={1}>
          {t('There are 3 types of tests')}:
        </S.HintText>
        <S.HintUList>
          <li>{t('MINOR')}</li>
          <li>{t('MAJOR')}</li>
          <li>{t('CRITICAL')}</li>
        </S.HintUList>
        <S.HintText variant='body1'>
          {t('One minor test has weight of 1')}.{' '}
          {t('One major test has weight of all minor tests')}.
          {t('One critical test has weight of all major tests')}.
        </S.HintText>
        <S.HintHeader variant='h4' mt={2}>
          {t('SLA colour')}.
        </S.HintHeader>
        <S.HintText variant='body1' mt={1}>
          {t('There are 3 SLA colours')}:
        </S.HintText>
        <S.HintUList>
          <li>{t('Green')}</li>
          <li>{t('Yellow')}</li>
          <li>{t('Red')}</li>
        </S.HintUList>
        <S.HintOList $isOList>
          {orderedLiElement(
            t('If at least one critical test is failed > '),
            SLAColour.RED
          )}
          {orderedLiElement(t('If all major tests are failed > '), SLAColour.RED)}
          {orderedLiElement(
            t(
              'If all major tests except one are failed and all minor test are failed > '
            ),
            SLAColour.RED
          )}
          {orderedLiElement(t(`If dataset doesn't have tests > `), SLAColour.YELLOW)}
          {orderedLiElement(
            t(`If at least one major test failed and all critical are passed > `),
            SLAColour.YELLOW
          )}
          {orderedLiElement(
            t(`If all minor tests are failed, majors and critical are passed > `),
            SLAColour.YELLOW
          )}
          {orderedLiElement(
            t(`If all tests are passed or some of minors are failed >             `),
            SLAColour.GREEN
          )}
        </S.HintOList>
      </>
    );
  }, []);

  return (
    <>
      {isSLAReportNotFetched ? null : (
        <S.Container>
          {isSLAReportFetching ? <OverviewDQSLAReportSkeleton /> : null}
          {dqSLAReport ? (
            <Grid container direction='column' sx={{ py: 0.5 }}>
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
                    title={SLAHint}
                    checkForOverflow={false}
                    placement='bottom-end'
                    componentsProps={{ tooltip: { sx: S.TooltipStyles } }}
                  >
                    <InformationIcon width={14} height={14} />
                  </AppTooltip>
                </Grid>
                <Grid item>
                  <CopyButton stringToCopy={slaRef} buttonType='secondary-m-icon' />
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
          ) : null}
        </S.Container>
      )}
    </>
  );
};

export default OverviewDQSLAReport;
