import { toTimestamp } from 'lib/helpers';
import type { PageInfo, SerializeDateToNumber } from 'redux/interfaces/common';

export const assignWith = <
  TargetType extends Record<string, any>,
  SourceType extends Record<string, any>,
  ReturnType extends Record<keyof TargetType | keyof SourceType, unknown> = TargetType &
    SourceType
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

export const isDateObject = (value: unknown): value is Date =>
  typeof value === 'object' && value instanceof Date;

export const isNotDateObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && !(value instanceof Date);

export const isArray = (value: unknown): value is Array<unknown> => Array.isArray(value);

export const castDatesToTimestampInItemsArray = <
  Data extends object,
  RData extends object
>(
  data: Array<Data>
): Array<RData> =>
  data.map<RData>(item =>
    Object.entries(item).reduce<RData>(
      (memo, [key, value]) =>
        isDateObject(value)
          ? { ...memo, [key]: toTimestamp(value) }
          : { ...memo, [key]: value },
      {} as RData
    )
  );

export function setPageInfo<Item extends { id: string; createdAt: number }>(
  items: Item[],
  maxItemsSize: number
): PageInfo<string>;
export function setPageInfo<Item extends { id: number; createdAt: number }>(
  items: Item[],
  maxItemsSize: number
): PageInfo<number>;
export function setPageInfo<Item extends { id: string | number; createdAt: number }>(
  items: Item[],
  maxItemsSize: number
): PageInfo<string | number> {
  const lastItem = items.slice(-1);
  let pageInfo: PageInfo<string | number>;
  if (items.length < maxItemsSize) {
    pageInfo = { hasNext: false };
    return pageInfo;
  }

  pageInfo = {
    hasNext: true,
    lastId: lastItem[0].id,
    lastDateTime: lastItem[0].createdAt,
  };
  return pageInfo;
}

export const notEmpty = <TValue>(value: TValue | null | undefined): value is TValue =>
  value !== null && value !== undefined;

export function castDatesToTimestamp<Data>(
  data: Array<Data>
): SerializeDateToNumber<Data>[];
export function castDatesToTimestamp<Data>(data: Data): SerializeDateToNumber<Data>;
export function castDatesToTimestamp<Data>(data: Array<Data> | Data) {
  if (!data) return {};

  if (Array.isArray(data)) {
    return data.map(item => castDatesToTimestamp(item));
  }

  return Object.entries(data).reduce((memo, [key, value]) => {
    if (isNotDateObject(value) || isArray(value)) {
      return { ...memo, [key]: value ? castDatesToTimestamp(value) : undefined };
    }

    return isDateObject(value)
      ? { ...memo, [key]: toTimestamp(value) }
      : { ...memo, [key]: value };
  }, {});
}
