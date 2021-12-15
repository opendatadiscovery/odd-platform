import { createAsyncAction } from 'typesafe-actions';
import { DataEntityList } from 'generated-sources';
import { DataEntityGroupLinkedList } from 'redux/interfaces';

export const fetchDataEntityGroupLinkedListAction = createAsyncAction(
  'GET_DATA_ENTITY_GROUP_LINKED_LIST__REQUEST',
  'GET_DATA_ENTITY_GROUP_LINKED_LIST__SUCCESS',
  'GET_DATA_ENTITY_GROUP_LINKED_LIST__FAILURE'
)<undefined, DataEntityGroupLinkedList<DataEntityList>, undefined>();
