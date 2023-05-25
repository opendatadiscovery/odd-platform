import React from 'react';
import { Grid, Typography } from '@mui/material';
import {
  DataEntityClassNameEnum,
  type DataEntityDetails,
  type DataQualityTest,
} from 'generated-sources';
import { useAppDateTime, useAppPaths } from 'lib/hooks';
import {
  Button,
  EntitiesListModal,
  EntityClassItem,
  LabeledInfoItem,
  TestRunStatusItem,
  TestRunStatusReasonModal,
} from 'components/shared/elements';
import * as S from './OverviewQualityTestStatsStyles';

interface OverviewQualityTestStatsProps {
  suiteName: DataEntityDetails['suiteName'];
  suiteUrl: DataEntityDetails['suiteUrl'];
  datasetsList: DataEntityDetails['datasetsList'];
  qualityTest: DataQualityTest;
  dataEntityName: string | undefined;
}

const OverviewQualityTestStats: React.FC<OverviewQualityTestStatsProps> = ({
  suiteName,
  suiteUrl,
  dataEntityName,
  qualityTest,
  datasetsList,
}) => {
  const { dataEntityOverviewPath, dataEntityHistoryPath } = useAppPaths();
  const { qualityTestFormattedDateTime, formatDistanceStrict } = useAppDateTime();

  const displayedEntitiesNumber = 10;

  return (
    <Grid container flexDirection='column'>
      <Grid item sx={{ mb: 1.25 }}>
        <EntityClassItem
          entityClassName={DataEntityClassNameEnum.QUALITY_TEST}
          fullName
        />
      </Grid>
      <S.StatsContainer container>
        <Grid item lg={4} container flexDirection='column' alignItems='flex-start'>
          <Typography variant='h4' sx={{ mb: 1 }}>
            {datasetsList?.length || 0}{' '}
            {`dataset${datasetsList?.length === 1 ? '' : 's'}`}
          </Typography>
          {datasetsList?.slice(0, displayedEntitiesNumber).map(dataset => (
            <Button
              text={dataset.internalName || dataset.externalName}
              to={dataEntityOverviewPath(dataset.id)}
              key={dataset.id}
              sx={{ my: 0.25, maxWidth: '100%' }}
              buttonType='link-m'
            />
          ))}
          {datasetsList && datasetsList.length > displayedEntitiesNumber ? (
            <EntitiesListModal
              entities={datasetsList}
              labelFor='Datasets'
              dataEntityName={dataEntityName}
              openBtnEl={
                <Button text='Show All' buttonType='tertiary-m' sx={{ my: 0.25 }} />
              }
            />
          ) : null}
        </Grid>
        {suiteUrl && (
          <Grid item lg={4}>
            <Grid container flexDirection='column' alignItems='flex-start'>
              <Typography variant='h4' sx={{ mb: 1 }}>
                Suite
              </Typography>
              <Button
                text={suiteName || suiteUrl}
                to={suiteUrl}
                sx={{ my: 0.25, maxWidth: '100%' }}
                buttonType='link-m'
                target='_blank'
              />
            </Grid>
          </Grid>
        )}
        <S.Overview item lg={4}>
          <Typography variant='h4'>Last execution</Typography>
          {qualityTest?.latestRun?.status && (
            <LabeledInfoItem
              inline
              label='Status'
              labelWidth={3}
              runStatus={qualityTest.latestRun?.status}
            >
              <Grid container flexWrap='nowrap' alignItems='center'>
                <TestRunStatusItem
                  sx={{ mr: 1.25 }}
                  typeName={qualityTest.latestRun?.status}
                />
                {qualityTest.latestRun.statusReason && (
                  <TestRunStatusReasonModal
                    openBtn={<Button text='Status reason' buttonType='link-m' />}
                    statusReason={qualityTest.latestRun.statusReason}
                  />
                )}
              </Grid>
            </LabeledInfoItem>
          )}
          <LabeledInfoItem inline label='Date' labelWidth={3}>
            {qualityTest?.latestRun?.startTime &&
              qualityTestFormattedDateTime(qualityTest?.latestRun?.startTime.getTime())}
          </LabeledInfoItem>
          <LabeledInfoItem inline label='Duration' labelWidth={3}>
            {qualityTest?.latestRun?.startTime &&
              qualityTest?.latestRun?.endTime &&
              formatDistanceStrict(
                qualityTest.latestRun.endTime,
                qualityTest.latestRun.startTime,
                { addSuffix: false }
              )}
          </LabeledInfoItem>
          <Grid container>
            <Button
              text='History'
              buttonType='secondary-m'
              to={dataEntityHistoryPath(qualityTest?.id)}
            />
          </Grid>
        </S.Overview>
      </S.StatsContainer>
    </Grid>
  );
};

export default OverviewQualityTestStats;
