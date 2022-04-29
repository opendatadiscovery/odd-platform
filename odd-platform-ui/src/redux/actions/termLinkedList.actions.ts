import { createAsyncAction } from 'typesafe-actions';
import { DataEntityList } from 'generated-sources';
import { TermGroupLinkedList } from 'redux/interfaces';

export const fetchTermGroupLinkedListAction = createAsyncAction(
  'GET_TERM_GROUP_LINKED_LIST__REQUEST',
  'GET_TERM_GROUP_LINKED_LIST__SUCCESS',
  'GET_TERM_GROUP_LINKED_LIST__FAILURE'
)<undefined, TermGroupLinkedList<DataEntityList>, undefined>();
