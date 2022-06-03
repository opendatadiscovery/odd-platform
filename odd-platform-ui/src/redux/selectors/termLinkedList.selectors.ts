import { createSelector } from '@reduxjs/toolkit';
import {
  DataEntitiesState,
  RootState,
  TermLinkedListState,
} from 'redux/interfaces';
import { createStatusesSelector, getTermId } from 'redux/selectors';
import * as actions from 'redux/actions';

const termLinkedListState = ({
  termLinkedList,
}: RootState): TermLinkedListState => termLinkedList;

const dataEntitiesState = ({
  dataEntities,
}: RootState): DataEntitiesState => dataEntities;

export const getTermLinkedListFetchingStatuses = createStatusesSelector(
  actions.fetchTermLinkedListAction
);

export const getTermLinkedList = createSelector(
  termLinkedListState,
  dataEntitiesState,
  getTermId,
  (linkedLists, dataEntities, termId) =>
    linkedLists.linkedItemsIdsByTermId?.[termId]?.map(
      id => dataEntities.byId[id]
    ) || []
);

export const getTermLinkedListPageInfo = createSelector(
  termLinkedListState,
  linkedList => linkedList.pageInfo
);
