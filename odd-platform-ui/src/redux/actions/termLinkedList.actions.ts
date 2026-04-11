import { createActionType } from 'redux/lib/helpers';

export const termLinkedListActionTypePrefix = 'termLinkedList';

export const fetchTermLinkedListAction = createActionType(
  termLinkedListActionTypePrefix,
  'fetchTermLinkedList'
);
