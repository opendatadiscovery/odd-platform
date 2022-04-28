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

export const assignWith = <TargetType, SourceType>(
  target: TargetType,
  source: SourceType,
  customizer: (targetValue: any, sourceValue: any) => any
) => {
  const targetEntries = Object.entries(source);
  const sourceEntries = Object.entries(source);
  const result = targetEntries.map(([targetKey, targetValue], idx) => {
    const [sourceKey, sourceValue] = sourceEntries[idx];
    return [targetKey, customizer(targetValue, sourceValue)];
  });
  return Object.fromEntries(result);
};
