import type {
  Namespace,
  NamespaceApiCreateNamespaceRequest,
  NamespaceApiDeleteNamespaceRequest,
  NamespaceApiGetNamespaceListRequest,
  NamespaceApiUpdateNamespaceRequest,
} from 'generated-sources';
import * as actions from 'redux/actions';
import type { CurrentPageInfo } from 'redux/interfaces';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';
import { namespaceApi } from 'lib/api';

export const fetchNamespaceList = handleResponseAsyncThunk<
  { namespaceList: Array<Namespace>; pageInfo: CurrentPageInfo },
  NamespaceApiGetNamespaceListRequest
>(
  actions.fetchNamespacesActionType,
  async ({ page, size, query }) => {
    const { items, pageInfo } = await namespaceApi.getNamespaceList({
      page,
      size,
      query,
    });

    return { namespaceList: items, pageInfo: { ...pageInfo, page } };
  },
  {}
);

export const createNamespace = handleResponseAsyncThunk<
  Namespace,
  NamespaceApiCreateNamespaceRequest
>(
  actions.createNamespaceActionType,
  async ({ namespaceFormData }) =>
    await namespaceApi.createNamespace({ namespaceFormData }),
  {
    setSuccessOptions: ({ namespaceFormData }) => ({
      id: `Namespace-creating-${namespaceFormData.name}`,
      message: `Namespace ${namespaceFormData.name} successfully created.`,
    }),
  }
);

export const updateNamespace = handleResponseAsyncThunk<
  Namespace,
  NamespaceApiUpdateNamespaceRequest
>(
  actions.updateNamespaceActionType,
  async ({ namespaceId, namespaceUpdateFormData }) =>
    await namespaceApi.updateNamespace({ namespaceId, namespaceUpdateFormData }),
  {
    setSuccessOptions: ({ namespaceUpdateFormData }) => ({
      id: `Namespace-updating-${namespaceUpdateFormData.name}`,
      message: `Namespace ${namespaceUpdateFormData.name} successfully updated.`,
    }),
  }
);

export const deleteNamespace = handleResponseAsyncThunk<
  number,
  NamespaceApiDeleteNamespaceRequest
>(
  actions.deleteNamespaceActionType,
  async ({ namespaceId }) => {
    await namespaceApi.deleteNamespace({ namespaceId });

    return namespaceId;
  },
  {
    setSuccessOptions: ({ namespaceId }) => ({
      id: `Namespace-deleting-${namespaceId}`,
      message: `Namespace successfully deleted.`,
    }),
  }
);
