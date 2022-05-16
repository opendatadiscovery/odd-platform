import {
  Configuration,
  OwnerApi,
  DataEntityApi,
  RoleApi,
  TermApi,
  OwnerList,
  Owner,
  OwnerApiGetOwnerListRequest,
  OwnerApiCreateOwnerRequest,
  OwnerApiUpdateOwnerRequest,
  OwnerApiDeleteOwnerRequest,
  Ownership,
  DataEntityApiCreateOwnershipRequest,
  DataEntityApiUpdateOwnershipRequest,
  DataEntityApiDeleteOwnershipRequest,
  RoleApiGetRoleListRequest,
  RoleList,
  TermApiCreateTermOwnershipRequest,
  TermApiDeleteTermOwnershipRequest,
  TermApiUpdateTermOwnershipRequest,
} from 'generated-sources';
import { createThunk } from 'redux/thunks/base.thunk';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import {
  PaginatedResponse,
  PartialEntityUpdateParams,
  PartialTermDetailsUpdateParams,
} from 'redux/interfaces/common';

const apiClientConf = new Configuration(BASE_PARAMS);
const apiClient = new OwnerApi(apiClientConf);
const dataEntityApiClient = new DataEntityApi(apiClientConf);
const roleApiClient = new RoleApi(apiClientConf);
const termApiClient = new TermApi(apiClientConf);

export const fetchOwnersList = createThunk<
  OwnerApiGetOwnerListRequest,
  OwnerList,
  PaginatedResponse<OwnerList>
>(
  (params: OwnerApiGetOwnerListRequest = { page: 1, size: 50 }) =>
    apiClient.getOwnerList(params),
  actions.fetchOwnersAction,
  (response: OwnerList, request: OwnerApiGetOwnerListRequest) => ({
    ...response,
    pageInfo: {
      ...response.pageInfo,
      page: request.page,
      hasNext: request.size * request.page < response.pageInfo.total,
    },
  })
);

export const createOwner = createThunk<
  OwnerApiCreateOwnerRequest,
  Owner,
  Owner
>(
  (params: OwnerApiCreateOwnerRequest) => apiClient.createOwner(params),
  actions.createOwnerAction,
  (response: Owner) => response
);

export const updateOwner = createThunk<
  OwnerApiUpdateOwnerRequest,
  Owner,
  Owner
>(
  (params: OwnerApiUpdateOwnerRequest) => apiClient.updateOwner(params),
  actions.updateOwnerAction,
  (response: Owner) => response
);

export const deleteOwner = createThunk<
  OwnerApiDeleteOwnerRequest,
  void,
  number
>(
  (params: OwnerApiDeleteOwnerRequest) => apiClient.deleteOwner(params),
  actions.deleteOwnerAction,
  (_: void, request: OwnerApiDeleteOwnerRequest) => request.ownerId
);

// Data entity ownership
export const createDataEntityOwnership = createThunk<
  DataEntityApiCreateOwnershipRequest,
  Ownership,
  PartialEntityUpdateParams<Ownership>
>(
  (params: DataEntityApiCreateOwnershipRequest) =>
    dataEntityApiClient.createOwnership(params),
  actions.createDataEntityOwnershipAction,
  (response: Ownership, request: DataEntityApiCreateOwnershipRequest) => ({
    entityId: request.dataEntityId,
    value: response,
  })
);

export const updateDataEntityOwnership = createThunk<
  DataEntityApiUpdateOwnershipRequest,
  Ownership,
  PartialEntityUpdateParams<Ownership>
>(
  (params: DataEntityApiUpdateOwnershipRequest) =>
    dataEntityApiClient.updateOwnership(params),
  actions.updateDataEntityOwnershipAction,
  (response: Ownership, request: DataEntityApiUpdateOwnershipRequest) => ({
    entityId: request.dataEntityId,
    value: response,
  })
);

export const deleteDataEntityOwnership = createThunk<
  DataEntityApiDeleteOwnershipRequest,
  void,
  PartialEntityUpdateParams<number>
>(
  (params: DataEntityApiDeleteOwnershipRequest) =>
    dataEntityApiClient.deleteOwnership(params),
  actions.deleteDataEntityOwnershipAction,
  (_, request: DataEntityApiDeleteOwnershipRequest) => ({
    entityId: request.dataEntityId,
    value: request.ownershipId,
  })
);

// Term ownership

export const createTermDetailsOwnership = createThunk<
  TermApiCreateTermOwnershipRequest,
  Ownership,
  PartialTermDetailsUpdateParams<Ownership>
>(
  (params: TermApiCreateTermOwnershipRequest) =>
    termApiClient.createTermOwnership(params),
  actions.createTermDetailsOwnershipAction,
  (response: Ownership, request: TermApiCreateTermOwnershipRequest) => ({
    termId: request.termId,
    value: response,
  })
);

export const updateTermDetailsOwnership = createThunk<
  TermApiUpdateTermOwnershipRequest,
  Ownership,
  PartialTermDetailsUpdateParams<Ownership>
>(
  (params: TermApiUpdateTermOwnershipRequest) =>
    termApiClient.updateTermOwnership(params),
  actions.updateTermDetailsOwnershipAction,
  (response: Ownership, request: TermApiUpdateTermOwnershipRequest) => ({
    termId: request.termId,
    value: response,
  })
);

export const deleteTermDetailsOwnership = createThunk<
  TermApiDeleteTermOwnershipRequest,
  void,
  PartialTermDetailsUpdateParams<number>
>(
  (params: TermApiDeleteTermOwnershipRequest) =>
    termApiClient.deleteTermOwnership(params),
  actions.deleteTermDetailsOwnershipAction,
  (_, request: TermApiDeleteTermOwnershipRequest) => ({
    termId: request.termId,
    value: request.ownershipId,
  })
);

// Roles

export const fetchRoleList = createThunk<
  RoleApiGetRoleListRequest,
  RoleList,
  RoleList
>(
  (params: RoleApiGetRoleListRequest) => roleApiClient.getRoleList(params),
  actions.fetchRolesAction,
  (response: RoleList) => response
);
