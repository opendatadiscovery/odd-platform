import { PageInfo as GeneratedPageInfo } from 'generated-sources';

export interface CurrentPageInfo extends GeneratedPageInfo {
  page: number;
}

export interface PageInfo {
  hasNext: boolean;
  lastId?: string;
}
