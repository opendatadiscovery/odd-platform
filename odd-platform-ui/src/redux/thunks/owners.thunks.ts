import {
  Configuration,
  DataEntityApi,
  DataEntityApiCreateOwnershipRequest,
  DataEntityApiDeleteOwnershipRequest,
  DataEntityApiUpdateOwnershipRequest,
  Owner,
  OwnerApi,
  OwnerApiCreateOwnerRequest,
  OwnerApiDeleteOwnerRequest,
  OwnerApiGetOwnerListRequest,
  OwnerApiUpdateOwnerRequest,
  Ownership,
  RoleApi,
  RoleApiGetRoleListRequest,
  RoleList,
  TermApi,
  TermApiCreateTermOwnershipRequest,
  TermApiDeleteTermOwnershipRequest,
  TermApiUpdateTermOwnershipRequest,
} from 'generated-sources';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { CurrentPageInfo } from 'redux/interfaces';
import { createAsyncThunk } from '@reduxjs/toolkit';

const apiClientConf = new Configuration(BASE_PARAMS);
const ownerApi = new OwnerApi(apiClientConf);
const dataEntityApi = new DataEntityApi(apiClientConf);
const roleApi = new RoleApi(apiClientConf);
const termApi = new TermApi(apiClientConf);

export const fetchRoleList = createAsyncThunk<
  { roleList: RoleList['items'] },
  RoleApiGetRoleListRequest
>(actions.fetchRolesAction, async ({ page, size, query }) => {
  const { items } = await roleApi.getRoleList({
    page,
    size,
    query,
  });

  return { roleList: items };
});

export const fetchOwnersList = createAsyncThunk<
  { items: Array<Owner>; pageInfo: CurrentPageInfo },
  OwnerApiGetOwnerListRequest
>(actions.fetchOwnersAction, async params => {
  const { items, pageInfo } = await ownerApi.getOwnerList(params);

  return { items, pageInfo: { ...pageInfo, page: params.page } };
});

export const createOwner = createAsyncThunk<Owner, OwnerApiCreateOwnerRequest>(
  actions.createOwnerAction,
  async ({ ownerFormData }) => ownerApi.createOwner({ ownerFormData })
);

export const deleteOwner = createAsyncThunk<
  { ownerId: number },
  OwnerApiDeleteOwnerRequest
>(actions.deleteOwnerAction, async ({ ownerId }) => {
  await ownerApi.deleteOwner({ ownerId });

  return { ownerId };
});

export const updateOwner = createAsyncThunk<
  { ownerId: number; owner: Owner },
  OwnerApiUpdateOwnerRequest
>(actions.updateOwnerAction, async ({ ownerId, ownerFormData }) => {
  const owner = await ownerApi.updateOwner({ ownerId, ownerFormData });

  return { ownerId, owner };
});

// Data entity ownership
export const createDataEntityOwnership = createAsyncThunk<
  { dataEntityId: number; ownership: Ownership },
  DataEntityApiCreateOwnershipRequest
>(
  actions.createDataEntityOwnershipAction,
  async ({ dataEntityId, ownershipFormData }) => {
    const ownership = await dataEntityApi.createOwnership({
      dataEntityId,
      ownershipFormData,
    });

    return { dataEntityId, ownership };
  }
);

export const updateDataEntityOwnership = createAsyncThunk<
  { dataEntityId: number; ownership: Ownership },
  DataEntityApiUpdateOwnershipRequest
>(
  actions.updateDataEntityOwnershipAction,
  async ({ dataEntityId, ownershipId, ownershipUpdateFormData }) => {
    const ownership = await dataEntityApi.updateOwnership({
      dataEntityId,
      ownershipId,
      ownershipUpdateFormData,
    });

    return { dataEntityId, ownership };
  }
);

export const deleteDataEntityOwnership = createAsyncThunk<
  { dataEntityId: number; ownershipId: number },
  DataEntityApiDeleteOwnershipRequest
>(actions.deleteDataEntityOwnershipAction, async ({ dataEntityId, ownershipId }) => {
  await dataEntityApi.deleteOwnership({ dataEntityId, ownershipId });

  return { dataEntityId, ownershipId };
});

// Term ownership

export const createTermOwnership = createAsyncThunk<
  { termId: number; ownership: Ownership },
  TermApiCreateTermOwnershipRequest
>(actions.createTermOwnershipAction, async ({ termId, ownershipFormData }) => {
  const ownership = await termApi.createTermOwnership({
    termId,
    ownershipFormData,
  });

  return { termId, ownership };
});

export const updateTermOwnership = createAsyncThunk<
  { termId: number; ownershipId: number; ownership: Ownership },
  TermApiUpdateTermOwnershipRequest
>(
  actions.updateTermOwnershipAction,
  async ({ termId, ownershipId, ownershipUpdateFormData }) => {
    const ownership = await termApi.updateTermOwnership({
      termId,
      ownershipId,
      ownershipUpdateFormData,
    });

    return { termId, ownershipId, ownership };
  }
);

export const deleteTermOwnership = createAsyncThunk<
  { termId: number; ownershipId: number },
  TermApiDeleteTermOwnershipRequest
>(actions.deleteTermOwnershipAction, async ({ termId, ownershipId }) => {
  await termApi.deleteTermOwnership({ termId, ownershipId });

  return { termId, ownershipId };
});
