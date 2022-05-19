import { createActionType } from 'lib/redux/helpers';

export const dataEntityGroupLinkedListActionTypePrefix =
  'dataEntityGroupLinkedList';

export const fetchDataEntityGroupLinkedListAction = createActionType(
  dataEntityGroupLinkedListActionTypePrefix,
  'fetchDataEntityGroupLinkedList'
);
