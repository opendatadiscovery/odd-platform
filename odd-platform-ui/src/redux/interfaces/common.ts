import { PageInfo } from 'generated-sources';

export interface CurrentPageInfo extends PageInfo {
  page: number;
}

export type PaginatedResponse<T> = T & { pageInfo: CurrentPageInfo };
