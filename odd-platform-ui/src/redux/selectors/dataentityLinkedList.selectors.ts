import { createSelector } from 'reselect';
import {
  DataEntityGroupLinkedListState,
  RootState,
} from 'redux/interfaces';
import { createFetchingSelector } from 'redux/selectors/loader-selectors';

const dataEntityGroupLinkedListState = ({
  dataEntityGroupLinkedList,
}: RootState): DataEntityGroupLinkedListState => dataEntityGroupLinkedList;

const getDEGLinkedListFetchingStatus = createFetchingSelector(
  'GET_DATA_ENTITY_GROUP_LINKED_LIST'
);

export const getIsDEGLinkedListFetching = createSelector(
  getDEGLinkedListFetchingStatus,
  status => status === 'fetching'
);

export const getDataEntityGroupId = (
  _: RootState,
  dataEntityGroupId: number | string
) => dataEntityGroupId;

export const getDataEntityGroupLinkedList = createSelector(
  dataEntityGroupLinkedListState,
  getDataEntityGroupId,
  (linkedLists, dataEntityGroupId) =>
    linkedLists.linkedListByDataEntityGroupId[dataEntityGroupId]
);

export const getDataEntityGroupLinkedListPage = createSelector(
  dataEntityGroupLinkedListState,
  linkedList => linkedList.pageInfo
);
