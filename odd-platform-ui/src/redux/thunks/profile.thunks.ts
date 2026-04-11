import type { AssociatedOwner } from 'generated-sources';
import * as actions from 'redux/actions';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';
import { identityApi } from 'lib/api';

export const fetchIdentity = handleResponseAsyncThunk<AssociatedOwner>(
  actions.fetchIdentityActionType,
  async () => await identityApi.whoami(),
  {}
);
