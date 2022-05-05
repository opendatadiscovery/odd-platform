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
} from 'generated-sources';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { CurrentPageInfo } from 'redux/interfaces/common';
import { createAsyncThunk } from '@reduxjs/toolkit';

const apiClientConf = new Configuration(BASE_PARAMS);
const ownerApi = new OwnerApi(apiClientConf);
const dataEntityApi = new DataEntityApi(apiClientConf);
const roleApi = new RoleApi(apiClientConf);

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
  { ownersList: Array<Owner>; pageInfo: CurrentPageInfo },
  OwnerApiGetOwnerListRequest
>(actions.fetchOwnersAction, async ({ page, size, query }) => {
  const { items, pageInfo } = await ownerApi.getOwnerList({
    page,
    size,
    query,
  });

  return { ownersList: items, pageInfo: { ...pageInfo, page } };
});

export const createOwner = createAsyncThunk<
  Owner,
  OwnerApiCreateOwnerRequest
>(actions.createOwnerAction, async ({ ownerFormData }) => {
  const owner = await ownerApi.createOwner({ ownerFormData });

  return owner;
});

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
>(
  actions.deleteDataEntityOwnershipAction,
  async ({ dataEntityId, ownershipId }) => {
    await dataEntityApi.deleteOwnership({ dataEntityId, ownershipId });

    return { dataEntityId, ownershipId };
  }
);
