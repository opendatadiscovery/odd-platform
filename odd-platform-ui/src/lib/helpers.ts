import { DataSetFieldTypeTypeEnum } from 'generated-sources';
import capitalize from 'lodash/capitalize';
import join from 'lodash/join';
import slice from 'lodash/slice';
import split from 'lodash/split';

export const isComplexField = (fieldType: DataSetFieldTypeTypeEnum) =>
  [
    DataSetFieldTypeTypeEnum.STRUCT,
    DataSetFieldTypeTypeEnum.LIST,
    DataSetFieldTypeTypeEnum.MAP,
  ].includes(fieldType);

export const stringFormatted = (
  value: string,
  splitter: '_' | '.',
  removePrefix?: boolean
) =>
  capitalize(
    join(slice(split(value, splitter), removePrefix ? 1 : 0), ' ')
  );
