import {
  Configuration,
  IdentityApi,
  AssociatedOwner,
  IdentityApiAssociateOwnerRequest,
} from 'generated-sources';
import * as actions from 'redux/actions';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_PARAMS } from 'lib/constants';

const apiClientConf = new Configuration(BASE_PARAMS);
const apiClient = new IdentityApi(apiClientConf);

export const fetchIdentity = createAsyncThunk<AssociatedOwner>(
  actions.fetchIdentityActionType,
  async () => {
    const response = await apiClient.whoami();
    return response;
  }
);

export const updateIdentityOwner = createAsyncThunk<
  AssociatedOwner,
  IdentityApiAssociateOwnerRequest
>(actions.updateIdentityOwnerActionType, async params => {
  const response = await apiClient.associateOwner(params);
  return response;
});
