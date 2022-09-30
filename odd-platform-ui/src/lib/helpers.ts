import { DataQualityTestExpectation, DataSetFieldTypeTypeEnum } from 'generated-sources';
import capitalize from 'lodash/capitalize';
import { Theme } from '@mui/material';
import { CRUDType } from 'lib/interfaces';

export const isComplexField = (fieldType: DataSetFieldTypeTypeEnum) =>
  [
    DataSetFieldTypeTypeEnum.STRUCT,
    DataSetFieldTypeTypeEnum.LIST,
    DataSetFieldTypeTypeEnum.MAP,
  ].includes(fieldType);

export const stringFormatted = (
  value: string,
  splitter: '_' | '.',
  capitalizing: 'all' | 'firstLetterOfString' | 'firstLetterOfEveryWord' | 'disabled',
  removePrefix?: boolean
) => {
  const capitalizeBy = (str: string, idx: number) => {
    if (capitalizing === 'all') return str.toUpperCase();
    if (capitalizing === 'firstLetterOfEveryWord') return capitalize(str);
    if (capitalizing === 'firstLetterOfString' && idx === 0) return capitalize(str);

    return str;
  };

  return value
    .split(splitter)
    .slice(removePrefix ? 1 : 0)
    .map(capitalizeBy)
    .join(' ');
};

export const toDateWithoutOffset = (dateToCast: number): Date => {
  const date = new Date(dateToCast);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - userTimezoneOffset);
};

export const toTimestampWithoutOffset = (dateToCast: Date): number => {
  const userTimezoneOffset = dateToCast.getTimezoneOffset() * 60000;
  return dateToCast.getTime() + userTimezoneOffset;
};

export const setActivityBackgroundColor = (
  theme: Theme,
  eventType?: CRUDType
): string => {
  switch (eventType) {
    case 'created':
      return theme.palette.activityEvent.created;
    case 'updated':
      return theme.palette.activityEvent.updated;
    case 'deleted':
      return theme.palette.activityEvent.deleted;
    default:
      return '';
  }
};

export const hasDataQualityTestExpectations = (
  expectations?: DataQualityTestExpectation
) => expectations && Object.keys(expectations).some(key => expectations[key]);
