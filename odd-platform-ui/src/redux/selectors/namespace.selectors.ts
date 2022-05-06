import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'redux/interfaces';
import { createLegacyFetchingSelector } from 'redux/selectors/loader-selectors';
import { NamespacesState } from 'redux/interfaces/state';

const namespacesState = ({ namespaces }: RootState): NamespacesState =>
  namespaces;

const getNamespaceListFetchingStatus =
  createLegacyFetchingSelector('GET_NAMESPACES');

export const getNamespaceCreateStatus =
  createLegacyFetchingSelector('POST_NAMESPACES');

export const getNamespaceUpdateStatus =
  createLegacyFetchingSelector('PUT_NAMESPACE');

export const deleteNamespaceUpdateStatus =
  createLegacyFetchingSelector('DELETE_NAMESPACE');

export const getIsNamespaceListFetching = createSelector(
  getNamespaceListFetchingStatus,
  status => status === 'fetching'
);

export const getNamespaceList = createSelector(
  namespacesState,
  namespaces => namespaces.allIds.map(id => namespaces.byId[id])
);

export const getIsNamespaceCreating = createSelector(
  getNamespaceCreateStatus,
  status => status === 'fetching'
);

export const getIsNamespaceUpdating = createSelector(
  getNamespaceUpdateStatus,
  status => status === 'fetching'
);

export const getIsNamespaceDeleting = createSelector(
  deleteNamespaceUpdateStatus,
  status => status === 'fetching'
);

export const getNamespaceListPage = createSelector(
  namespacesState,
  namespacesList => namespacesList.pageInfo
);
