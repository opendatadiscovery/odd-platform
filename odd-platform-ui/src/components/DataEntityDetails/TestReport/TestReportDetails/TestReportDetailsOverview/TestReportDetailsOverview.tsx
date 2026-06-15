import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  Button,
  LabeledInfoItem,
  TestRunStatusItem,
  TestRunStatusReasonModal,
} from 'components/shared/elements';
import type { DataQualityTestExpectation } from 'generated-sources';
import { DataQualityTestSeverity, Permission } from 'generated-sources';
import {
  getDatasetTestListFetchingStatuses,
  getQualityTestByTestId,
} from 'redux/selectors';
import { useAppDateTime } from 'lib/hooks';
import { hasDataQualityTestExpectations } from 'lib/helpers';
import { useAppSelector } from 'redux/lib/hooks';
import { WithPermissions } from 'components/shared/contexts';
import { useDataEntityRouteParams } from 'routes';
import TestReportDetailsOverviewSkeleton from './TestReportDetailsOverviewSkeleton/TestReportDetailsOverviewSkeleton';
import TestReportDetailsOverviewParametersModal from './TestReportDetailsOverviewParametersModal/TestReportDetailsOverviewParametersModal';
import SelectableSeverity from './SelectableSeverity/SelectableSeverity';
import * as S from './TestReportDetailsOverviewStyles';

const TestReportDetailsOverview: React.FC = () => {
  const { t } = useTranslation();
  const { dataEntityId, dataQATestId } = useDataEntityRouteParams();
  const { qualityTestRunFormattedDateTime, formatDistanceStrict } = useAppDateTime();

  const qualityTest = useAppSelector(getQualityTestByTestId(dataQATestId));

  const { isLoading: isDatasetTestListFetching } = useAppSelector(
    getDatasetTestListFetchingStatuses
  );

  const stringifyParams = JSON.stringify(qualityTest?.expectation, null, 2);
  const [showSeeMore, setShowSeeMore] = React.useState(false);
  const paramsRef = React.useRef<HTMLParagraphElement>(null);

  React.useEffect(() => {
    if (paramsRef.current) {
      const { clientHeight, scrollHeight } = paramsRef.current;
      setShowSeeMore(scrollHeight > clientHeight);
    }
  }, [isDatasetTestListFetching, paramsRef.current]);

  return (
    <Grid container direction='column' wrap='nowrap'>
      {isDatasetTestListFetching ? (
        <TestReportDetailsOverviewSkeleton length={1} />
      ) : (
        <>
          <LabeledInfoItem
            label={t('Severity')}
            inline
            labelWidth={2.4}
            valueComponent='div'
            sx={{ mt: 2 }}
          >
            <WithPermissions
              permissionTo={Permission.DATASET_TEST_RUN_SET_SEVERITY}
              renderContent={({ isAllowedTo }) => (
                <SelectableSeverity
                  currentSeverity={qualityTest?.severity || DataQualityTestSeverity.MAJOR}
                  dataEntityId={dataEntityId}
                  dataQATestId={dataQATestId}
                  disabled={!isAllowedTo}
                />
              )}
            />
          </LabeledInfoItem>

          <S.LatestRunInfoContainer container>
            <Typography variant='h4'>{t('Last execution')}</Typography>
            <LabeledInfoItem label={t('Date')} inline labelWidth={2.4}>
              {qualityTest?.latestRun?.startTime &&
                qualityTestRunFormattedDateTime(
                  qualityTest?.latestRun?.startTime.getTime()
                )}
            </LabeledInfoItem>
            <LabeledInfoItem label={t('Duration')} inline labelWidth={2.4}>
              {qualityTest?.latestRun?.startTime &&
                qualityTest?.latestRun.endTime &&
                formatDistanceStrict(
                  qualityTest?.latestRun.endTime,
                  qualityTest?.latestRun.startTime,
                  { addSuffix: false }
                )}
            </LabeledInfoItem>
            {qualityTest.latestRun?.status && (
              <LabeledInfoItem label={t('Status')} inline labelWidth={2.4}>
                <Grid container flexWrap='nowrap' alignItems='center'>
                  <TestRunStatusItem
                    sx={{ mr: 1.25 }}
                    typeName={qualityTest.latestRun?.status}
                  />
                  {qualityTest.latestRun.statusReason && (
                    <TestRunStatusReasonModal
                      openBtn={<Button text={t('Status reason')} buttonType='link-m' />}
                      statusReason={qualityTest.latestRun.statusReason}
                    />
                  )}
                </Grid>
              </LabeledInfoItem>
            )}
          </S.LatestRunInfoContainer>

          {hasDataQualityTestExpectations(qualityTest?.expectation) && (
            <Grid container sx={{ mt: 2 }} flexDirection='column'>
              <Typography variant='h4'>{t('Parameters')}</Typography>
              <S.Params $isExpandable={showSeeMore} ref={paramsRef} variant='body1'>
                {stringifyParams}
              </S.Params>
              {showSeeMore && (
                <Box sx={{ px: 1.5, py: 0.25 }}>
                  <TestReportDetailsOverviewParametersModal
                    openBtnEl={<Button text={t('See more')} buttonType='tertiary-m' />}
                    expectations={qualityTest?.expectation as DataQualityTestExpectation}
                  />
                </Box>
              )}
            </Grid>
          )}

          {!!qualityTest?.linkedUrlList?.length && (
            <Grid item sx={{ mt: 2.25 }} xs={12}>
              <Typography variant='h4'>{t('Links')}</Typography>
              <Grid container sx={{ mt: 1 }}>
                {qualityTest.linkedUrlList.map(({ name, url }) => (
                  <Button
                    text={name}
                    to={url}
                    key={url}
                    sx={{ py: 0.25 }}
                    buttonType='tertiary-m'
                    target='_blank'
                  />
                ))}
              </Grid>
            </Grid>
          )}
        </>
      )}
    </Grid>
  );
};

export default TestReportDetailsOverview;
