import { CurrentPageInfo } from 'redux/interfaces/common';

export interface TermGroupLinkedList<T> {
  termId: number;
  value: T;
  pageInfo: CurrentPageInfo;
}
