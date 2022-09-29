import { toTimestampWithoutOffset } from 'lib/helpers';

export const assignWith = <
  TargetType extends Record<string, any>,
  SourceType extends Record<string, any>,
  ReturnType extends Record<
    keyof TargetType | keyof SourceType,
    unknown
  > = TargetType & SourceType
>(
  target: TargetType,
  source: SourceType,
  customizer: <K extends keyof SourceType>(
    targetValue: K extends keyof TargetType ? TargetType[K] : undefined,
    sourceValue: SourceType[K]
  ) => ReturnType[K]
): ReturnType =>
  Object.keys(source).reduce(
    (ac, sourceKey) => ({
      ...ac,
      [sourceKey]: customizer(target[sourceKey], source[sourceKey]),
    }),
    target
  ) as unknown as ReturnType;

export const createActionType = (actionPrefix: string, action: string) =>
  `${actionPrefix}/${action}`;

export const isDateType = (value: unknown): value is Date =>
  typeof value === 'object' && value instanceof Date;

export const castItemDatesToTimestampInArray = <
  Data extends object,
  RData extends object
>(
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
