import type { PageInfo as GeneratedPageInfo } from 'generated-sources';

export interface CurrentPageInfo extends GeneratedPageInfo {
  page: number;
}

export interface PageInfo {
  hasNext: boolean;
  lastId?: string;
}

export type SerializeDateToNumber<Data> = {
  [Key in keyof Data]: Data[Key] extends Date | undefined
    ? number
    : SerializeDateToNumber<Data[Key]>;
};
