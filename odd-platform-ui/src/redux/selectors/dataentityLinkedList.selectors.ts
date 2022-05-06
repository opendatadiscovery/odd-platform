import { createSelector } from '@reduxjs/toolkit';
import {
  DataEntitiesState,
  DataEntityGroupLinkedListState,
  RootState,
} from 'redux/interfaces';
import * as actions from 'redux/actions';
import { createLegacyFetchingSelector } from 'redux/selectors/loader-selectors';

const dataEntityGroupLinkedListState = ({
  dataEntityGroupLinkedList,
}: RootState): DataEntityGroupLinkedListState => dataEntityGroupLinkedList;

const dataEntitiesState = ({
  dataEntities,
}: RootState): DataEntitiesState => dataEntities;

const getDEGLinkedListFetchingStatus = createLegacyFetchingSelector(
  actions.fetchDataEntityGroupLinkedListAction
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
  dataEntitiesState,
  getDataEntityGroupId,
  (linkedLists, dataEntities, dataEntityGroupId) =>
    linkedLists.linkedItemsIdsByDataEntityGroupId?.[
      dataEntityGroupId
    ]?.map(id => dataEntities.byId[id])
);

export const getDataEntityGroupLinkedListPage = createSelector(
  dataEntityGroupLinkedListState,
  linkedList => linkedList.pageInfo
);
