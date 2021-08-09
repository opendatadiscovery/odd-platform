import {
  Configuration,
  NamespaceApi,
  NamespaceList,
  Namespace,
  NamespaceApiCreateNamespaceRequest,
  NamespaceApiUpdateNamespaceRequest,
  NamespaceApiDeleteNamespaceRequest,
  NamespaceApiGetNamespaceListRequest,
} from 'generated-sources';
import { createThunk } from 'redux/thunks/base.thunk';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { PaginatedResponse } from 'redux/interfaces/common';

const apiClientConf = new Configuration(BASE_PARAMS);
const apiClient = new NamespaceApi(apiClientConf);

export const fetchNamespaceList = createThunk<
  NamespaceApiGetNamespaceListRequest,
  NamespaceList,
  PaginatedResponse<NamespaceList>
>(
  (params: NamespaceApiGetNamespaceListRequest) => apiClient.getNamespaceList(params),
  actions.fetchNamespacesAction,
  (response: NamespaceList, request: NamespaceApiGetNamespaceListRequest) => ({
    ...response,
    pageInfo: {
      ...response.pageInfo,
      total: response.pageInfo?.total || 0,
      page: request.page,
      hasNext: response.items.length === request.size,
    },
  })
);

export const createNamespace = createThunk<
  NamespaceApiCreateNamespaceRequest,
  Namespace,
  Namespace
>(
  (params: NamespaceApiCreateNamespaceRequest) => apiClient.createNamespace(params),
  actions.createNamespacesAction,
  (result: Namespace) => result
);

export const updateNamespace = createThunk<
  NamespaceApiUpdateNamespaceRequest,
  Namespace,
  Namespace
>(
  (params: NamespaceApiUpdateNamespaceRequest) => apiClient.updateNamespace(params),
  actions.updateNamespaceAction,
  (result: Namespace) => result
);

export const deleteNamespace = createThunk<
  NamespaceApiDeleteNamespaceRequest,
  void,
  number
>(
  (params: NamespaceApiDeleteNamespaceRequest) => apiClient.deleteNamespace(params),
  actions.deleteNamespaceAction,
  (_, reqParams) => reqParams.namespaceId
);
