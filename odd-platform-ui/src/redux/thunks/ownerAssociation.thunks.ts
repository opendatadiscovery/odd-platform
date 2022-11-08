import {
  Configuration,
  type OwnerAssociationRequest,
  OwnerAssociationRequestApi,
  type OwnerAssociationRequestApiCreateOwnerAssociationRequestRequest,
  type OwnerAssociationRequestApiGetOwnerAssociationRequestListRequest,
  type OwnerAssociationRequestApiUpdateOwnerAssociationRequestRequest,
} from 'generated-sources';
import * as actions from 'redux/actions';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_PARAMS } from 'lib/constants';
import type { CurrentPageInfo } from 'redux/interfaces';
import { getResponse } from 'lib/errorHandling';

const apiClientConf = new Configuration(BASE_PARAMS);
const ownerAssociationRequestApi = new OwnerAssociationRequestApi(apiClientConf);

const a = getResponse({} as Response);

export const createOwnerAssociationRequest = createAsyncThunk<
  OwnerAssociationRequest,
  OwnerAssociationRequestApiCreateOwnerAssociationRequestRequest
>(
  actions.createOwnerAssociationRequestActionType,
  async ({ ownerFormData }, { rejectWithValue }) => {
    try {
      const request = await ownerAssociationRequestApi.createOwnerAssociationRequest({
        ownerFormData,
      });

      // showSuccessToast({
      //   id: `association-request-${ownerFormData.name}`,
      //   message: `Request for associating with owner ${ownerFormData.name} successfully created.`,
      // });

      return request;
    } catch (error) {
      // const errorResp = await getResponse(error as Response);
      // showServerErrorToast({
      //   status: errorResp.status,
      //   message: errorResp.message,
      //   toastId: errorResp.url,
      // });

      // return rejectWithValue(errorResp);
      return rejectWithValue({});
    }
  }
);

export const fetchOwnerAssociationRequestList = createAsyncThunk<
  { items: Array<OwnerAssociationRequest>; pageInfo: CurrentPageInfo; active: boolean },
  OwnerAssociationRequestApiGetOwnerAssociationRequestListRequest
>(actions.fetchOwnerAssociationRequestsListActionType, async params => {
  const { items, pageInfo } =
    await ownerAssociationRequestApi.getOwnerAssociationRequestList(params);

  return {
    items,
    pageInfo: { ...pageInfo, page: params.page },
    active: params.active,
  };
});

export const updateOwnerAssociationRequest = createAsyncThunk<
  number,
  OwnerAssociationRequestApiUpdateOwnerAssociationRequestRequest
>(actions.updateOwnerAssociationRequestActionType, async params => {
  const { id } = await ownerAssociationRequestApi.updateOwnerAssociationRequest(params);

  return id;
});
