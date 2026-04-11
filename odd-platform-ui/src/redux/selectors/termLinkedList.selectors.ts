import { createSelector } from '@reduxjs/toolkit';
import type {
  CurrentPageInfo,
  DataEntitiesState,
  RootState,
  TermLinkedListState,
} from 'redux/interfaces';
import * as actions from 'redux/actions';
import {
  createErrorSelector,
  createStatusesSelector,
} from 'redux/selectors/loader-selectors';
import { emptyArr } from 'lib/constants';
import type { DataEntity } from 'generated-sources';

const termLinkedListState = ({ termLinkedList }: RootState): TermLinkedListState =>
  termLinkedList;

const dataEntitiesState = ({ dataEntities }: RootState): DataEntitiesState =>
  dataEntities;

export const getTermLinkedListFetchingStatuses = createStatusesSelector(
  actions.fetchTermLinkedListAction
);

export const getTermLinkedListFetchingErrors = createErrorSelector(
  actions.fetchTermLinkedListAction
);

export const getTermLinkedList = (termId: number) =>
  createSelector(
    termLinkedListState,
    dataEntitiesState,
    (linkedLists, dataEntities): DataEntity[] =>
      linkedLists.linkedItemsIdsByTermId?.[termId]?.map(id => dataEntities.byId[id]) ||
      emptyArr
  );

export const getTermLinkedListPageInfo = createSelector(
  termLinkedListState,
  (linkedList): CurrentPageInfo => linkedList.pageInfo
);
