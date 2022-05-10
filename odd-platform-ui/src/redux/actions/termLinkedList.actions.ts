import { createAsyncAction } from 'typesafe-actions';
import { DataEntityList } from 'generated-sources';
import { TermGroupLinkedList } from 'redux/interfaces';

export const fetchTermLinkedListAction = createAsyncAction(
  'GET_TERM_LINKED_LIST__REQUEST',
  'GET_TERM_LINKED_LIST__SUCCESS',
  'GET_TERM_LINKED_LIST__FAILURE'
)<undefined, TermGroupLinkedList<DataEntityList>, undefined>();
