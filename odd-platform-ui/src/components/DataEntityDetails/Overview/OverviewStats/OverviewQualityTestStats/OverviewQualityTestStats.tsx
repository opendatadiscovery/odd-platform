import React from 'react';
import { Grid, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import {
  DataEntityClassNameEnum,
  DataEntityDetails,
  DataQualityTest,
} from 'generated-sources';
import EntityClassItem from 'components/shared/EntityClassItem/EntityClassItem';
import { format, formatDistanceStrict } from 'date-fns';
import LabeledInfoItem from 'components/shared/LabeledInfoItem/LabeledInfoItem';
import AppButton from 'components/shared/AppButton/AppButton';
import { useAppPaths } from 'lib/hooks';
import * as S from './OverviewQualityTestStatsStyles';

interface OverviewQualityTestStatsProps {
  suiteName: DataEntityDetails['suiteName'];
  suiteUrl: DataEntityDetails['suiteUrl'];
  datasetsList: DataEntityDetails['datasetsList'];
  qualityTest: DataQualityTest;
}

const OverviewQualityTestStats: React.FC<
  OverviewQualityTestStatsProps
> = ({ suiteName, suiteUrl, datasetsList, qualityTest }) => {
  const { dataEntityDetailsPath, dataEntityHistoryPath } = useAppPaths();

  return (
    <Grid container>
      <Grid item sx={{ mb: 1.25 }}>
        <EntityClassItem
          entityClassName={DataEntityClassNameEnum.QUALITY_TEST}
          fullName
        />
      </Grid>
      <S.StatsContainer container>
        <Grid item sx={{ mr: 4 }}>
          <Grid item container>
            <Grid item container alignItems="baseline" sx={{ mb: 1 }}>
              <Typography variant="h2" sx={{ mr: 0.5 }}>
                {datasetsList?.length || 0}
              </Typography>
              <S.StatLabel variant="body2">datasets</S.StatLabel>
            </Grid>
            <Grid item>
              {datasetsList?.map(dataset => (
                <AppButton
                  key={dataset.id}
                  sx={{ my: 0.25 }}
                  size="medium"
                  color="tertiary"
                >
                  <Link to={dataEntityDetailsPath(dataset.id)}>
                    {dataset.internalName || dataset.externalName}
                  </Link>
                </AppButton>
              ))}
            </Grid>
          </Grid>
          {suiteUrl && (
            <Grid item container sx={{ mt: 5 }}>
              <Grid item container>
                <S.StatLabel variant="body2">Suite</S.StatLabel>
              </Grid>
              <Grid item>
                <AppButton
                  sx={{ my: 0.25 }}
                  size="medium"
                  color="tertiary"
                >
                  <Link to={{ pathname: suiteUrl }} target="_blank">
                    {suiteName || suiteUrl}
                  </Link>
                </AppButton>
              </Grid>
            </Grid>
          )}
        </Grid>
        <S.Overview item sx={{ mr: 4 }}>
          <Grid item container xs={12} alignItems="baseline">
            <S.StatLabel variant="body2">Last execution</S.StatLabel>
          </Grid>
          <LabeledInfoItem
            inline
            label="Status"
            labelWidth={4}
            runStatus={qualityTest.latestRun?.status}
          >
            {qualityTest?.latestRun?.status}
          </LabeledInfoItem>
          <LabeledInfoItem inline label="Date" labelWidth={4}>
            {qualityTest?.latestRun?.startTime &&
              format(
                qualityTest?.latestRun?.startTime,
                'd MMM yyyy, HH:MM a'
              )}
          </LabeledInfoItem>
          <LabeledInfoItem inline label="Duration" labelWidth={4}>
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

          {!!qualityTest?.linkedUrlList?.length && (
            <Grid container alignItems="baseline">
              <S.StatLabel variant="body1">Links</S.StatLabel>
              <Grid container sx={{ mt: 1 }}>
                <Grid item container xs={12}>
                  {qualityTest.linkedUrlList.map(link => (
                    <Typography variant="body1">
                      {`${link}, `}&nbsp;
                    </Typography>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          )}

          <Grid container>
            <Link to={dataEntityHistoryPath(qualityTest?.id)}>
              <AppButton size="small" color="tertiary">
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
