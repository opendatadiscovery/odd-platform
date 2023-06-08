import type {
  DataSourceEntityList as GeneratedDataSourceEntityList,
  DataEntityList as GeneratedDataEntityList,
} from 'generated-sources';
import type { InfiniteQueryPageInfo } from './shared';

interface DataEntityList extends Omit<GeneratedDataEntityList, 'pageInfo'> {
  pageInfo: InfiniteQueryPageInfo;
}

export interface DataSourceEntityList
  extends Omit<GeneratedDataSourceEntityList, 'entities'> {
  entities: DataEntityList;
}
