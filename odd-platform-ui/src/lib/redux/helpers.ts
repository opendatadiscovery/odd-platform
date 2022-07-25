import { toTimestampWithoutOffset } from 'lib/helpers';

export const assignWith = <TargetType, SourceType>(
  target: TargetType,
  source: SourceType,
  customizer: (targetValue: any, sourceValue: any) => any
) => {
  const targetEntries = Object.entries(source);
  const sourceEntries = Object.entries(source);
  const result = targetEntries.map(([targetKey, targetValue], idx) => {
    const { 1: sourceValue } = sourceEntries[idx];
    return [targetKey, customizer(targetValue, sourceValue)];
  });
  return Object.fromEntries(result);
};

export const createActionType = (actionPrefix: string, action: string) =>
  `${actionPrefix}/${action}`;

export const isDateType = (value: any) =>
  typeof value === 'object' && value instanceof Date;

export const castItemDatesToTimestampInArray = <Data, RData>(
  data: Array<Data>
): Array<RData> =>
  data.map<RData>(item =>
    Object.entries(item).reduce<RData>(
      (memo, [key, value]) =>
        isDateType(value)
          ? {
              ...memo,
              [key]: toTimestampWithoutOffset(value),
            }
          : { ...memo, [key]: value },
      {} as RData
    )
  );
