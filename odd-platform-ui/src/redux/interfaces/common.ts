import { PageInfo } from 'generated-sources';

export interface CurrentPageInfo extends PageInfo {
  page: number;
}

export type PaginatedResponse<T> = T & { pageInfo: CurrentPageInfo };

export interface PartialEntityUpdateParams<T> {
  entityId: number;
  value: T;
}

export interface PartialEntityUpdateParamsPaginated<T> {
  entityId: number;
  value: T;
  pageInfo: CurrentPageInfo;
}
