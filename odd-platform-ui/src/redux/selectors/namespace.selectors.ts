import { createSelector } from '@reduxjs/toolkit';
import type { RootState, NamespacesState } from 'redux/interfaces';
import { createStatusesSelector } from 'redux/selectors/loader-selectors';
import { namespaceAdapter } from 'redux/slices/namespace.slice';
import * as actions from 'redux/actions';

const namespacesState = ({ namespaces }: RootState): NamespacesState => namespaces;

export const { selectAll: getNamespaceList } = namespaceAdapter.getSelectors<RootState>(
  state => state.namespaces
);

export const getNamespaceListFetchingStatuses = createStatusesSelector(
  actions.fetchNamespacesActionType
);

export const getNamespaceCreatingStatuses = createStatusesSelector(
  actions.createNamespaceActionType
);

export const getNamespaceUpdatingStatuses = createStatusesSelector(
  actions.updateNamespaceActionType
);

export const getNamespaceDeletingStatuses = createStatusesSelector(
  actions.deleteNamespaceActionType
);

export const getNamespaceListPageInfo = createSelector(
  namespacesState,
  namespacesList => namespacesList.pageInfo
);
