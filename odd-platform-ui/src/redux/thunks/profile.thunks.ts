import {
  AssociatedOwner,
  Configuration,
  IdentityApi,
} from 'generated-sources';
import { createThunk } from 'redux/thunks/base.thunk';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';

const apiClientConf = new Configuration(BASE_PARAMS);
const apiClient = new IdentityApi(apiClientConf);

export const fetchIdentity = createThunk<
  void,
  AssociatedOwner | void,
  AssociatedOwner | void
>(
  () => apiClient.whoami(),
  actions.fetchIdentityAction,
  (response: AssociatedOwner | void) => response
);

// export const updateIdentityOwner = createThunk<
//   IdentityApiAssociateOwnerRequest,
//   AssociatedOwner | void,
//   AssociatedOwner | void
// >(
//   (params: IdentityApiAssociateOwnerRequest) =>
//     apiClient.associateOwner(params),
//   actions.fetchIdentityAction,
//   (response: AssociatedOwner | void) => response
// );
