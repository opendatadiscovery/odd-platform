import { createActionType } from 'lib/redux/helpers';

export const termLinkedListActionTypePrefix = 'termLinkedList';

export const fetchTermLinkedListAction = createActionType(
  termLinkedListActionTypePrefix,
  'fetchTermLinkedList'
);
