import React from 'react';
import { Grid, Typography } from '@mui/material';
import type { DataSetFormattedStats, DataSetFormattedStatsKeys } from 'redux/interfaces';
import { DatasetStatsLabelMap } from 'redux/interfaces';
import { LabeledInfoItem, NumberFormatted } from 'components/shared/elements';
import type { DataSetField, DataSetStats } from 'generated-sources';
import { DataSetFieldTypeTypeEnum } from 'generated-sources';
import round from 'lodash/round';
import { useAppDateTime } from 'lib/hooks';
import * as S from './DatasetField.styles';

interface DatasetFieldStatsProps {
  datasetField: DataSetField;
  rowsCount: DataSetStats['rowsCount'];
}

const DatasetFieldStats: React.FC<DatasetFieldStatsProps> = ({
  datasetField,
  rowsCount,
}) => {
  const { datasetFieldFormattedDateTime } = useAppDateTime();

  let fieldStats = {} as DataSetFormattedStats;
  switch (datasetField.type.type) {
    case DataSetFieldTypeTypeEnum.STRING:
      fieldStats = datasetField.stats?.stringStats as DataSetFormattedStats;
      break;
    case DataSetFieldTypeTypeEnum.BOOLEAN:
      fieldStats = datasetField.stats?.booleanStats as DataSetFormattedStats;
      break;
    case DataSetFieldTypeTypeEnum.INTEGER:
      fieldStats = datasetField.stats?.integerStats as DataSetFormattedStats;
      break;
    case DataSetFieldTypeTypeEnum.NUMBER:
      fieldStats = datasetField.stats?.numberStats as DataSetFormattedStats;
      break;
    case DataSetFieldTypeTypeEnum.DATETIME:
      fieldStats = datasetField.stats?.datetimeStats as DataSetFormattedStats;
      break;
    case DataSetFieldTypeTypeEnum.BINARY:
      fieldStats = datasetField.stats?.binaryStats as DataSetFormattedStats;
      break;
    default:
      fieldStats = datasetField.stats?.complexStats as DataSetFormattedStats;
  }

  const getCustomStat = React.useCallback(() => {
    const resultFieldStats = Object.keys(fieldStats);

    const getStatLabel = (fieldStatName: string) =>
      DatasetStatsLabelMap.get(fieldStatName as DataSetFormattedStatsKeys);
    const getStatValue = (fieldStatName: string) =>
      fieldStatName ? fieldStats[fieldStatName as DataSetFormattedStatsKeys] : undefined;

    return (
      <>
        {resultFieldStats.map(fieldStatName => {
          const label = getStatLabel(fieldStatName);
          const value = getStatValue(fieldStatName);

          if (fieldStatName.length !== 0 && label && value) {
            return (
              <S.StatCellContainer key={fieldStatName}>
                <LabeledInfoItem label={label}>
                  {datasetField.type.type === DataSetFieldTypeTypeEnum.DATETIME ? (
                    datasetFieldFormattedDateTime((value as unknown as Date).getTime())
                  ) : (
                    <NumberFormatted value={value} precision={1} />
                  )}
                </LabeledInfoItem>
              </S.StatCellContainer>
            );
          }

          return null;
        })}
      </>
    );
  }, [datasetField.type.type, fieldStats]);

  const getPredefinedStats = React.useCallback(
    (statValue: number) => (
      <Grid container flexWrap='nowrap'>
        <NumberFormatted value={statValue} />
        <Typography sx={{ ml: 0.5 }} variant='body1' color='texts.hint'>
          {statValue && rowsCount > 0
            ? `(${round((statValue * 100) / rowsCount, 0)}%)`
            : null}
        </Typography>
      </Grid>
    ),
    [rowsCount]
  );

  return (
    <S.Container container>
      <S.StatCellContainer>
        <Typography variant='subtitle1'>Unique</Typography>
        {getPredefinedStats(fieldStats?.uniqueCount)}
      </S.StatCellContainer>
      <S.StatCellContainer>
        <Typography variant='subtitle1'>Missing</Typography>
        {getPredefinedStats(fieldStats?.nullsCount)}
      </S.StatCellContainer>
      {getCustomStat()}
    </S.Container>
  );
};

export default DatasetFieldStats;
