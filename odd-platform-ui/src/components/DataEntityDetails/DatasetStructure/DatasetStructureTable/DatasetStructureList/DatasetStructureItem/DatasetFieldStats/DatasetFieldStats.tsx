import React from 'react';
import { Grid, Typography } from '@mui/material';
import {
  DataSetFormattedStats,
  DataSetFormattedStatsKeys,
  DatasetStatsLabelMap,
} from 'redux/interfaces';
import { LabeledInfoItem, NumberFormatted } from 'components/shared';
import {
  DataSetField,
  DataSetFieldTypeTypeEnum,
  DataSetStats,
} from 'generated-sources';
import { format } from 'date-fns';
import round from 'lodash/round';
import * as S from './DatsetFieldStatsStyles';

interface DatasetFieldStatsProps {
  datasetField: DataSetField;
  rowsCount: DataSetStats['rowsCount'];
}

const DatasetFieldStats: React.FC<DatasetFieldStatsProps> = ({
  datasetField,
  rowsCount,
}) => {
  let fieldStats = {} as DataSetFormattedStats;
  switch (datasetField.type.type) {
    case DataSetFieldTypeTypeEnum.STRING:
      fieldStats = datasetField.stats
        ?.stringStats as DataSetFormattedStats;
      break;
    case DataSetFieldTypeTypeEnum.BOOLEAN:
      fieldStats = datasetField.stats
        ?.booleanStats as DataSetFormattedStats;
      break;
    case DataSetFieldTypeTypeEnum.INTEGER:
    case DataSetFieldTypeTypeEnum.NUMBER:
      fieldStats = datasetField.stats
        ?.numberStats as DataSetFormattedStats;
      break;
    case DataSetFieldTypeTypeEnum.DATETIME:
      fieldStats = datasetField.stats
        ?.datetimeStats as DataSetFormattedStats;
      break;
    case DataSetFieldTypeTypeEnum.BINARY:
      fieldStats = datasetField.stats
        ?.binaryStats as DataSetFormattedStats;
      break;
    default:
      fieldStats = datasetField.stats
        ?.complexStats as DataSetFormattedStats;
  }

  const getCustomStat = React.useCallback(() => {
    const resultFieldStats = fieldStats
      ? Object.keys(fieldStats)
      : ['', '', '', ''];

    const getStatLabel = (fieldStatName: string) =>
      DatasetStatsLabelMap.get(fieldStatName as DataSetFormattedStatsKeys);
    const getStatValue = (fieldStatName: string) =>
      fieldStatName
        ? fieldStats[fieldStatName as DataSetFormattedStatsKeys]
        : undefined;

    return (
      <Grid item lg={4} container flexWrap="nowrap">
        {resultFieldStats.map((fieldStatName, idx) => {
          const label = getStatLabel(fieldStatName);
          const value = getStatValue(fieldStatName);

          if (fieldStatName.length !== 0 && label && value) {
            return (
              <S.StatCellContainer item lg={3} key={fieldStatName}>
                <LabeledInfoItem label={label}>
                  {datasetField.type.type ===
                  DataSetFieldTypeTypeEnum.DATETIME ? (
                    format(value, 'd MMM yyyy')
                  ) : (
                    <NumberFormatted value={value} precision={1} />
                  )}
                </LabeledInfoItem>
              </S.StatCellContainer>
            );
          }

          return (
            <S.StatCellContainer
              item
              lg={3}
              // eslint-disable-next-line react/no-array-index-key
              key={`${fieldStatName}-${idx}`}
            />
          );
        })}
      </Grid>
    );
  }, [datasetField.type.type, fieldStats]);

  const getPredefinedStats = React.useCallback(
    (statValue: number) => (
      <S.StatCellContainer item lg={1}>
        <NumberFormatted value={statValue} />
        <Typography sx={{ ml: 0.5 }} variant="body1" color="texts.hint">
          {statValue && rowsCount
            ? `(${round((statValue * 100) / rowsCount, 0)}%)`
            : null}
        </Typography>
      </S.StatCellContainer>
    ),
    [rowsCount]
  );

  return (
    <>
      {getPredefinedStats(fieldStats?.uniqueCount)}
      {getPredefinedStats(fieldStats?.nullsCount)}
      {getCustomStat()}
    </>
  );
};

export default DatasetFieldStats;
