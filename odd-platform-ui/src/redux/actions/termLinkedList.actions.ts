import { createAction } from 'redux/lib/helpers';

export const termLinkedListActionPrefix = 'termLinkedList';

export const fetchTermLinkedListAction = createAction(
  termLinkedListActionPrefix,
  'fetchTermLinkedList'
);
