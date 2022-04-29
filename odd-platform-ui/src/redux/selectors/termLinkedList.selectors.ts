import { createSelector } from 'reselect';
import {
  DataEntitiesState,
  RootState,
  TermGroupLinkedListState,
} from 'redux/interfaces';
import { createFetchingSelector } from 'redux/selectors/loader-selectors';

const termGroupLinkedListState = ({
  termGroupLinkedList,
}: RootState): TermGroupLinkedListState => termGroupLinkedList;

const dataEntitiesState = ({
  dataEntities,
}: RootState): DataEntitiesState => dataEntities;

const getTGLinkedListFetchingStatus = createFetchingSelector(
  'GET_TERM_GROUP_LINKED_LIST'
);

export const getIsTGLinkedListFetching = createSelector(
  getTGLinkedListFetchingStatus,
  status => status === 'fetching'
);

export const getTermGroupId = (_: RootState, termId: number | string) =>
  termId;

export const getTermGroupLinkedList = createSelector(
  termGroupLinkedListState,
  dataEntitiesState,
  getTermGroupId,
  (linkedLists, dataEntities, termGroupId) =>
    linkedLists.linkedItemsIdsByTermGroupId?.[termGroupId]?.map(
      id => dataEntities.byId[id]
    )
);

export const getTermGroupLinkedListPage = createSelector(
  termGroupLinkedListState,
  linkedList => linkedList.pageInfo
);
