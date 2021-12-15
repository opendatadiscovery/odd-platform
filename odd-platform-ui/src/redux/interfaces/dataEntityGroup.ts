import { CurrentPageInfo } from 'redux/interfaces/common';

export interface DataEntityGroupLinkedList<T> {
  entityId: number;
  value: T;
  pageInfo: CurrentPageInfo;
}
