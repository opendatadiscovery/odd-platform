import { createSelector } from '@reduxjs/toolkit';
import type {
  DataEntitiesState,
  DataEntityGroupLinkedListState,
  RootState,
} from 'redux/interfaces';
import * as actions from 'redux/actions';
import { createStatusesSelector } from 'redux/selectors/loader-selectors';

const dataEntityGroupLinkedListState = ({
  dataEntityGroupLinkedList,
}: RootState): DataEntityGroupLinkedListState => dataEntityGroupLinkedList;

const dataEntitiesState = ({ dataEntities }: RootState): DataEntitiesState =>
  dataEntities;

export const getDEGLinkedListFetchingStatuses = createStatusesSelector(
  actions.fetchDataEntityGroupLinkedListAction
);

export const getDataEntityGroupLinkedList = (dataEntityGroupId: number) =>
  createSelector(
    dataEntityGroupLinkedListState,
    dataEntitiesState,
    (linkedLists, dataEntities) =>
      linkedLists.linkedItemsIdsByDataEntityGroupId?.[dataEntityGroupId]?.map(
        id => dataEntities.byId[id]
      )
  );

export const getDataEntityGroupLinkedListPage = createSelector(
  dataEntityGroupLinkedListState,
  linkedList => linkedList.pageInfo
);
