import {
  Configuration,
  type OwnerAssociationRequest,
  OwnerAssociationRequestApi,
  type OwnerAssociationRequestApiCreateOwnerAssociationRequestRequest,
  type OwnerAssociationRequestApiGetOwnerAssociationRequestListRequest,
  type OwnerAssociationRequestApiUpdateOwnerAssociationRequestRequest,
} from 'generated-sources';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import type { CurrentPageInfo } from 'redux/interfaces';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';

const apiClientConf = new Configuration(BASE_PARAMS);
const ownerAssociationRequestApi = new OwnerAssociationRequestApi(apiClientConf);

export const createOwnerAssociationRequest = handleResponseAsyncThunk<
  OwnerAssociationRequest,
  OwnerAssociationRequestApiCreateOwnerAssociationRequestRequest
>(
  actions.createOwnerAssociationRequestActionType,
  async ({ ownerFormData }) =>
    await ownerAssociationRequestApi.createOwnerAssociationRequest({
      ownerFormData,
    }),
  {
    setSuccessOptions: ({ ownerFormData }) => ({
      id: `association-request-${ownerFormData.name}`,
      message: `Request for associating with owner ${ownerFormData.name} successfully created.`,
    }),
  }
);

export const fetchOwnerAssociationRequestList = handleResponseAsyncThunk<
  { items: Array<OwnerAssociationRequest>; pageInfo: CurrentPageInfo; active: boolean },
  OwnerAssociationRequestApiGetOwnerAssociationRequestListRequest
>(
  actions.fetchOwnerAssociationRequestsListActionType,
  async params => {
    const { items, pageInfo } =
      await ownerAssociationRequestApi.getOwnerAssociationRequestList(params);

    return {
      items,
      pageInfo: { ...pageInfo, page: params.page },
      active: params.active,
    };
  },
  {}
);

export const updateOwnerAssociationRequest = handleResponseAsyncThunk<
  number,
  OwnerAssociationRequestApiUpdateOwnerAssociationRequestRequest
>(
  actions.updateOwnerAssociationRequestActionType,
  async ({ ownerAssociationRequestId, ownerAssociationRequestStatusFormData }) => {
    const { id } = await ownerAssociationRequestApi.updateOwnerAssociationRequest({
      ownerAssociationRequestId,
      ownerAssociationRequestStatusFormData,
    });

    return id;
  },
  {
    setSuccessOptions: ({
      ownerAssociationRequestId,
      ownerAssociationRequestStatusFormData,
    }) => ({
      id: `association-request-${ownerAssociationRequestId}`,
      message: `Association request successfully ${ownerAssociationRequestStatusFormData.status?.toLowerCase()}.`,
    }),
  }
);
