import React from 'react';
import { Grid, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import {
  DataEntityClassNameEnum,
  DataEntityDetails,
  DataQualityTest,
} from 'generated-sources';
import { format, formatDistanceStrict } from 'date-fns';
import { useAppPaths } from 'lib/hooks';
import {
  EntitiesListModal,
  AppButton,
  LabeledInfoItem,
  EntityClassItem,
} from 'components/shared';
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
  const { dataEntityDetailsPath, dataEntityHistoryPath } = useAppPaths();
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
          <Typography variant='h3' sx={{ mb: 1.25 }}>
            {datasetsList?.length || 0}{' '}
            {`dataset${datasetsList?.length === 1 ? '' : 's'}`}
          </Typography>
          {datasetsList?.slice(0, displayedEntitiesNumber).map(dataset => (
            <AppButton
              to={dataEntityDetailsPath(dataset.id)}
              key={dataset.id}
              sx={{ my: 0.25 }}
              size='medium'
              color='tertiary'
              truncate
            >
              {dataset.internalName || dataset.externalName}
            </AppButton>
          ))}
          {datasetsList && datasetsList.length > displayedEntitiesNumber ? (
            <EntitiesListModal
              entities={datasetsList}
              labelFor='Datasets'
              dataEntityName={dataEntityName}
              openBtnEl={
                <AppButton size='medium' color='tertiary' sx={{ my: 0.25 }}>
                  Show All
                </AppButton>
              }
            />
          ) : null}
        </Grid>
        {suiteUrl && (
          <Grid item lg={4}>
            <Grid container flexDirection='column' alignItems='flex-start'>
              <Typography variant='h3' sx={{ mb: 1.25 }}>
                Suite
              </Typography>
              <AppButton
                to={{ pathname: suiteUrl }}
                sx={{ my: 0.25 }}
                size='medium'
                color='tertiary'
                truncate
                linkTarget='_blank'
              >
                {suiteName || suiteUrl}
              </AppButton>
            </Grid>
          </Grid>
        )}
        <S.Overview item lg={4}>
          <Typography variant='h3'>Last execution</Typography>
          <LabeledInfoItem
            inline
            label='Status'
            labelWidth={3}
            runStatus={qualityTest.latestRun?.status}
          >
            {qualityTest?.latestRun?.status}
          </LabeledInfoItem>
          <LabeledInfoItem inline label='Date' labelWidth={3}>
            {qualityTest?.latestRun?.startTime &&
              format(qualityTest?.latestRun?.startTime, 'd MMM yyyy, HH:MM a')}
          </LabeledInfoItem>
          <LabeledInfoItem inline label='Duration' labelWidth={3}>
            {qualityTest?.latestRun?.startTime &&
              qualityTest?.latestRun?.endTime &&
              formatDistanceStrict(
                qualityTest.latestRun.endTime,
                qualityTest.latestRun.startTime,
                {
                  addSuffix: false,
                }
              )}
          </LabeledInfoItem>
          <Grid container>
            <Link to={dataEntityHistoryPath(qualityTest?.id)}>
              <AppButton size='small' color='tertiary'>
                History
              </AppButton>
            </Link>
          </Grid>
        </S.Overview>
      </S.StatsContainer>
    </Grid>
  );
};

export default OverviewQualityTestStats;
