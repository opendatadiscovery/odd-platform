import { DataSetFieldTypeTypeEnum } from 'generated-sources';
import capitalize from 'lodash/capitalize';

export const isComplexField = (fieldType: DataSetFieldTypeTypeEnum) =>
  [
    DataSetFieldTypeTypeEnum.STRUCT,
    DataSetFieldTypeTypeEnum.LIST,
    DataSetFieldTypeTypeEnum.MAP,
  ].includes(fieldType);

export const stringFormatted = (
  value: string,
  splitter: '_' | '.',
  removePrefix?: boolean,
  capitalizeEveryWord?: boolean
): string => {
  const formattedString = value
    .split(splitter)
    .slice(removePrefix ? 1 : 0)
    .map(word => capitalize(word))
    .join(' ');
  return capitalizeEveryWord
    ? formattedString
    : capitalize(formattedString);
};
