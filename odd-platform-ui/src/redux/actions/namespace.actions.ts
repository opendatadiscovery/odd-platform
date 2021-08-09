import { createAsyncAction } from 'typesafe-actions';
import { NamespaceList, Namespace } from 'generated-sources';
import { PaginatedResponse } from 'redux/interfaces/common';

export const fetchNamespacesAction = createAsyncAction(
  'GET_NAMESPACES__REQUEST',
  'GET_NAMESPACES__SUCCESS',
  'GET_NAMESPACES__FAILURE'
)<undefined, PaginatedResponse<NamespaceList>, undefined>();

export const createNamespacesAction = createAsyncAction(
  'POST_NAMESPACES__REQUEST',
  'POST_NAMESPACES__SUCCESS',
  'POST_NAMESPACES__FAILURE'
)<undefined, Namespace, undefined>();

export const updateNamespaceAction = createAsyncAction(
  'PUT_NAMESPACE__REQUEST',
  'PUT_NAMESPACE__SUCCESS',
  'PUT_NAMESPACE__FAILURE'
)<undefined, Namespace, undefined>();

export const deleteNamespaceAction = createAsyncAction(
  'DELETE_NAMESPACE__REQUEST',
  'DELETE_NAMESPACE__SUCCESS',
  'DELETE_NAMESPACE__FAILURE'
)<undefined, number, undefined>();
