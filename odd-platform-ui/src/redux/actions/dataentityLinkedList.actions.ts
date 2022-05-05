import { createAction } from 'lib/helpers';

export const dataEntityGroupLinkedListActionPrefix =
  'dataEntityGroupLinkedList';

export const fetchDataEntityGroupLinkedListAction = createAction(
  dataEntityGroupLinkedListActionPrefix,
  'fetchDataEntityGroupLinkedList'
);
