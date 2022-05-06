import { createAction } from 'redux/lib/helpers';

export const dataEntityGroupLinkedListActionPrefix =
  'dataEntityGroupLinkedList';

export const fetchDataEntityGroupLinkedListAction = createAction(
  dataEntityGroupLinkedListActionPrefix,
  'fetchDataEntityGroupLinkedList'
);
