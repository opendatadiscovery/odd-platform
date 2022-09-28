import { AssociatedOwner, Configuration, IdentityApi } from 'generated-sources';
import * as actions from 'redux/actions';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { BASE_PARAMS } from 'lib/constants';

const apiClientConf = new Configuration(BASE_PARAMS);
const identityApi = new IdentityApi(apiClientConf);

export const fetchIdentity = createAsyncThunk<AssociatedOwner>(
  actions.fetchIdentityActionType,
  async () => identityApi.whoami()
);
