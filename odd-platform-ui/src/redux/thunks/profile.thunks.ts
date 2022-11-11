import { type AssociatedOwner, Configuration, IdentityApi } from 'generated-sources';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';

const apiClientConf = new Configuration(BASE_PARAMS);
const identityApi = new IdentityApi(apiClientConf);

export const fetchIdentity = handleResponseAsyncThunk<AssociatedOwner>(
  actions.fetchIdentityActionType,
  async () => await identityApi.whoami(),
  {}
);
