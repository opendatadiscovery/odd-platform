import React from 'react';
import { Grid, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import {
  DataEntityDetails,
  DataEntityClassNameEnum,
  DataQualityTest,
} from 'generated-sources';
import entries from 'lodash/entries';
import { dataEntityDetailsPath, dataEntityHistoryPath } from 'lib/paths';
import EntityClassItem from 'components/shared/EntityClassItem/EntityClassItem';
import { format, formatDistanceStrict } from 'date-fns';
import LabeledInfoItem from 'components/shared/LabeledInfoItem/LabeledInfoItem';
import AppButton from 'components/shared/AppButton/AppButton';
import * as S from './OverviewQualityTestStatsStyles';

interface OverviewQualityTestStatsProps {
  suiteName: DataEntityDetails['suiteName'];
  suiteUrl: DataEntityDetails['suiteUrl'];
  datasetsList: DataEntityDetails['datasetsList'];
  qualityTest: DataQualityTest;
}

const OverviewQualityTestStats: React.FC<OverviewQualityTestStatsProps> = ({
  suiteName,
  suiteUrl,
  datasetsList,
  qualityTest,
}) => (
  <Grid container>
    <Grid item sx={{ mb: 1.25 }}>
      <EntityClassItem
        typeName={DataEntityClassNameEnum.QUALITY_TEST}
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
        <Grid item container sx={{ mt: 5 }}>
          <Grid item container>
            <S.StatLabel variant="body2">Suite</S.StatLabel>
          </Grid>
          <Grid item>
            {suiteUrl ? (
              <AppButton sx={{ my: 0.25 }} size="medium" color="tertiary">
                <Link to={{ pathname: suiteUrl }} target="_blank">
                  {suiteName || suiteUrl}
                </Link>
              </AppButton>
            ) : null}
          </Grid>
        </Grid>
      </Grid>
      <S.Overview item sx={{ mr: 4 }}>
        <Grid item container xs={12} alignItems="baseline">
          <S.StatLabel variant="body2" sx={{ ml: 0.25 }}>
            Overview
          </S.StatLabel>
        </Grid>
        <LabeledInfoItem
          inline
          label="Last start"
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
        <LabeledInfoItem inline label="Severity" labelWidth={4}>
          null
        </LabeledInfoItem>
        <Grid container>
          <Link to={dataEntityHistoryPath(qualityTest?.id)}>
            <AppButton size="small" color="tertiary">
              History
            </AppButton>
          </Link>
        </Grid>
      </S.Overview>
      <Grid item container direction="column">
        <Grid item>
          <Grid item container xs={12} alignItems="baseline">
            <S.StatLabel variant="body2">Parameters</S.StatLabel>
          </Grid>
          <Grid container sx={{ mx: 0, mt: 1, mb: 3 }}>
            {entries(qualityTest?.expectation).map(([key, value]) => (
              <LabeledInfoItem inline key={key} label={key} labelWidth={8}>
                {value}
              </LabeledInfoItem>
            ))}
          </Grid>
        </Grid>
        <Grid item sx={{ mb: 3 }}>
          <Grid item container xs={12} alignItems="baseline">
            <S.StatLabel variant="body2">Links</S.StatLabel>
            <Grid container sx={{ mt: 1 }}>
              <Grid item container xs={12} wrap="nowrap">
                {qualityTest?.linkedUrlList?.map(link => (
                  <Typography variant="body1">
                    {`${link}, `}&nbsp;
                  </Typography>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Grid item container xs={12} alignItems="baseline">
            <S.StatLabel variant="body2">Execution</S.StatLabel>
            <Grid item xs={12} sx={{ mt: 1 }}>
              <Typography variant="body2" color="textSecondary">
                No information about test execution is available.
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </S.StatsContainer>
  </Grid>
);

export default OverviewQualityTestStats;
