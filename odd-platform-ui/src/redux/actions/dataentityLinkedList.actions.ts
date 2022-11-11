import { createActionType } from 'redux/lib/helpers';

export const dataEntityGroupLinkedListActionTypePrefix = 'dataEntityGroupLinkedList';

export const fetchDataEntityGroupLinkedListAction = createActionType(
  dataEntityGroupLinkedListActionTypePrefix,
  'fetchDataEntityGroupLinkedList'
);
