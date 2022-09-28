import {
  Configuration,
  OwnerAssociationRequest,
  OwnerAssociationRequestApi,
  OwnerAssociationRequestApiCreateOwnerAssociationRequestRequest,
  OwnerAssociationRequestApiGetOwnerAssociationRequestListRequest,
  OwnerAssociationRequestApiUpdateOwnerAssociationRequestRequest,
} from 'generated-sources';
import * as actions from 'redux/actions';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_PARAMS } from 'lib/constants';
import { CurrentPageInfo } from 'redux/interfaces';

const apiClientConf = new Configuration(BASE_PARAMS);
const ownerAssociationRequestApi = new OwnerAssociationRequestApi(apiClientConf);

export const createOwnerAssociationRequest = createAsyncThunk<
  OwnerAssociationRequest,
  OwnerAssociationRequestApiCreateOwnerAssociationRequestRequest
>(actions.createOwnerAssociationRequestActionType, async params =>
  ownerAssociationRequestApi.createOwnerAssociationRequest(params)
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
