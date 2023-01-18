import type { PageInfo as GeneratedPageInfo } from 'generated-sources';

export interface CurrentPageInfo extends GeneratedPageInfo {
  page: number;
}

export interface PageInfo<LastId extends string | number> {
  hasNext: boolean;
  lastId?: LastId;
  lastDateTime?: number;
}

export type SerializeDateToNumber<Data> = {
  [Key in keyof Data]: Data[Key] extends Date | undefined
    ? number
    : SerializeDateToNumber<Data[Key]>;
};

export interface PaginatedResponse<Data> {
  items: Data;
  pageInfo: CurrentPageInfo;
}

export interface KeySetPaginatedResponse<Data, LastId extends number> {
  items: Data;
  pageInfo: PageInfo<LastId>;
}

export type DataEntityId = { dataEntityId: number };
export type RelatedToEntityId<Data> = Data & DataEntityId;
export type RequiredField<I, K extends keyof I> = I & Required<Pick<I, K>>;
