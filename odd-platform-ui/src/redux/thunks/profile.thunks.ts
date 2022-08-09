import {
  AssociatedOwner,
  Configuration,
  IdentityApi,
} from 'generated-sources';
import * as actions from 'redux/actions';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_PARAMS } from 'lib/constants';

const apiClientConf = new Configuration(BASE_PARAMS);
const apiClient = new IdentityApi(apiClientConf);

export const fetchIdentity = createAsyncThunk<AssociatedOwner>(
  actions.fetchIdentityActionType,
  async () => apiClient.whoami()
);

// export const updateIdentityOwner = createAsyncThunk<
//   AssociatedOwner,
//   IdentityApiAssociateOwnerRequest
// >(actions.updateIdentityOwnerActionType, async params =>
//   apiClient.associateOwner(params)
// );
