import type { DataEntityGroupItemList as GeneratedDataEntityGroupList } from 'generated-sources';
import type { InfiniteQueryPageInfo } from './shared';

export interface DataEntityGroupList
  extends Omit<GeneratedDataEntityGroupList, 'pageInfo'> {
  pageInfo: InfiniteQueryPageInfo;
}
