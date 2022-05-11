import { createSelector } from 'reselect';
import {
  DataEntitiesState,
  RootState,
  TermLinkedListState,
} from 'redux/interfaces';
import { createFetchingSelector } from 'redux/selectors/loader-selectors';

const termGroupLinkedListState = ({
  termLinkedList,
}: RootState): TermLinkedListState => termLinkedList;

const dataEntitiesState = ({
  dataEntities,
}: RootState): DataEntitiesState => dataEntities;

const getTGLinkedListFetchingStatus = createFetchingSelector(
  'GET_TERM_LINKED_LIST'
);

export const getIsTermLinkedListFetching = createSelector(
  getTGLinkedListFetchingStatus,
  status => status === 'fetching'
);

export const getTermId = (_: RootState, termId: number | string) => termId;

export const getTermGroupLinkedList = createSelector(
  termGroupLinkedListState,
  dataEntitiesState,
  getTermId,
  (linkedLists, dataEntities, termId) =>
    linkedLists.linkedItemsIdsByTermId?.[termId]?.map(
      id => dataEntities.byId[id]
    ) || []
);

export const getTermLinkedListPageInfo = createSelector(
  termGroupLinkedListState,
  linkedList => linkedList.pageInfo
);
