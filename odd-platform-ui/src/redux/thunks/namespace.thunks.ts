import {
  Configuration,
  Namespace,
  NamespaceApi,
  NamespaceApiCreateNamespaceRequest,
  NamespaceApiDeleteNamespaceRequest,
  NamespaceApiGetNamespaceListRequest,
  NamespaceApiUpdateNamespaceRequest,
} from 'generated-sources';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { CurrentPageInfo } from 'redux/interfaces/common';
import { createAsyncThunk } from '@reduxjs/toolkit';

const apiClientConf = new Configuration(BASE_PARAMS);
const namespaceApi = new NamespaceApi(apiClientConf);

export const fetchNamespaceList = createAsyncThunk<
  { namespaceList: Array<Namespace>; pageInfo: CurrentPageInfo },
  NamespaceApiGetNamespaceListRequest
>(actions.fetchNamespacesActionType, async ({ page, size, query }) => {
  const { items, pageInfo } = await namespaceApi.getNamespaceList({
    page,
    size,
    query,
  });

  return { namespaceList: items, pageInfo: { ...pageInfo, page } };
});

export const createNamespace = createAsyncThunk<
  Namespace,
  NamespaceApiCreateNamespaceRequest
>(actions.createNamespaceActionType, async ({ namespaceFormData }) =>
  namespaceApi.createNamespace({
    namespaceFormData,
  })
);

export const updateNamespace = createAsyncThunk<
  Namespace,
  NamespaceApiUpdateNamespaceRequest
>(actions.updateNamespaceActionType, async ({ namespaceId, namespaceUpdateFormData }) =>
  namespaceApi.updateNamespace({
    namespaceId,
    namespaceUpdateFormData,
  })
);

export const deleteNamespace = createAsyncThunk<
  number,
  NamespaceApiDeleteNamespaceRequest
>(actions.deleteNamespaceActionType, async ({ namespaceId }) => {
  await namespaceApi.deleteNamespace({ namespaceId });

  return namespaceId;
});
