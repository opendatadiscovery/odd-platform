import {
  Configuration,
  DataEntityApi,
  type DataEntityApiCreateOwnershipRequest,
  type DataEntityApiDeleteOwnershipRequest,
  type DataEntityApiUpdateOwnershipRequest,
  type Owner,
  OwnerApi,
  type OwnerApiCreateOwnerRequest,
  type OwnerApiDeleteOwnerRequest,
  type OwnerApiGetOwnerListRequest,
  type OwnerApiUpdateOwnerRequest,
  type Ownership,
  TitleApi,
  type TitleApiGetTitleListRequest,
  type TitleList,
  TermApi,
  type TermApiCreateTermOwnershipRequest,
  type TermApiDeleteTermOwnershipRequest,
  type TermApiUpdateTermOwnershipRequest,
} from 'generated-sources';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import type { CurrentPageInfo } from 'redux/interfaces';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';

const apiClientConf = new Configuration(BASE_PARAMS);
const ownerApi = new OwnerApi(apiClientConf);
const dataEntityApi = new DataEntityApi(apiClientConf);
const titleApi = new TitleApi(apiClientConf);
const termApi = new TermApi(apiClientConf);

// TODO handle
export const fetchOwnershipTitleList = createAsyncThunk<
  { titleList: TitleList['items'] },
  TitleApiGetTitleListRequest
>(actions.fetchTitlesAction, async ({ page, size, query }) => {
  const { items } = await titleApi.getTitleList({ page, size, query });
  return { titleList: items };
});

// TODO handle
export const fetchOwnersList = createAsyncThunk<
  { items: Array<Owner>; pageInfo: CurrentPageInfo },
  OwnerApiGetOwnerListRequest
>(actions.fetchOwnersAction, async params => {
  const { items, pageInfo } = await ownerApi.getOwnerList(params);
  return { items, pageInfo: { ...pageInfo, page: params.page } };
});

export const createOwner = handleResponseAsyncThunk<Owner, OwnerApiCreateOwnerRequest>(
  actions.createOwnerAction,
  async ({ ownerFormData }) => await ownerApi.createOwner({ ownerFormData }),
  {
    setSuccessOptions: ({ ownerFormData }) => ({
      id: `Owner-creating-${ownerFormData.name}`,
      message: `Owner ${ownerFormData.name} successfully created.`,
    }),
  }
);

export const updateOwner = handleResponseAsyncThunk<
  { ownerId: number; owner: Owner },
  OwnerApiUpdateOwnerRequest
>(
  actions.updateOwnerAction,
  async ({ ownerId, ownerFormData }) => {
    const owner = await ownerApi.updateOwner({ ownerId, ownerFormData });
    return { ownerId, owner };
  },
  {
    setSuccessOptions: ({ ownerFormData }) => ({
      id: `Owner-updating-${ownerFormData.name}`,
      message: `Owner ${ownerFormData.name} successfully updated.`,
    }),
  }
);

export const deleteOwner = handleResponseAsyncThunk<number, OwnerApiDeleteOwnerRequest>(
  actions.deleteOwnerAction,
  async ({ ownerId }) => {
    await ownerApi.deleteOwner({ ownerId });
    return ownerId;
  },
  {
    setSuccessOptions: ({ ownerId }) => ({
      id: `Owner-deleting-${ownerId}`,
      message: `Owner successfully deleted.`,
    }),
  }
);

// Data entity ownership
export const createDataEntityOwnership = handleResponseAsyncThunk<
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
  },
  {
    setSuccessOptions: ({ ownershipFormData }) => ({
      id: `Ownership-creating-${ownershipFormData.ownerName}`,
      message: `Ownership ${ownershipFormData.ownerName} successfully created.`,
    }),
  }
);

export const updateDataEntityOwnership = handleResponseAsyncThunk<
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
  },
  {
    setSuccessOptions: ({ ownershipUpdateFormData }) => ({
      id: `Ownership-updating-${ownershipUpdateFormData.titleName}`,
      message: `Owner's title ${ownershipUpdateFormData.titleName} successfully updated.`,
    }),
  }
);

export const deleteDataEntityOwnership = handleResponseAsyncThunk<
  { dataEntityId: number; ownershipId: number },
  DataEntityApiDeleteOwnershipRequest
>(
  actions.deleteDataEntityOwnershipAction,
  async ({ dataEntityId, ownershipId }) => {
    await dataEntityApi.deleteOwnership({ dataEntityId, ownershipId });
    return { dataEntityId, ownershipId };
  },
  {
    setSuccessOptions: ({ ownershipId }) => ({
      id: `Ownership-deleting-${ownershipId}`,
      message: `Ownership successfully deleted.`,
    }),
  }
);

// Term ownership
export const createTermOwnership = handleResponseAsyncThunk<
  { termId: number; ownership: Ownership },
  TermApiCreateTermOwnershipRequest
>(
  actions.createTermOwnershipAction,
  async ({ termId, ownershipFormData }) => {
    const ownership = await termApi.createTermOwnership({
      termId,
      ownershipFormData,
    });
    return { termId, ownership };
  },
  {
    setSuccessOptions: ({ ownershipFormData }) => ({
      id: `Term-ownership-creating-${ownershipFormData.ownerName}`,
      message: `Term ownership ${ownershipFormData.ownerName} successfully created.`,
    }),
  }
);

export const updateTermOwnership = handleResponseAsyncThunk<
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
  },
  {
    setSuccessOptions: ({ ownershipUpdateFormData }) => ({
      id: `Term-ownership-updating-${ownershipUpdateFormData.titleName}`,
      message: `Term owner's title ${ownershipUpdateFormData.titleName} successfully updated.`,
    }),
  }
);

export const deleteTermOwnership = handleResponseAsyncThunk<
  { termId: number; ownershipId: number },
  TermApiDeleteTermOwnershipRequest
>(
  actions.deleteTermOwnershipAction,
  async ({ termId, ownershipId }) => {
    await termApi.deleteTermOwnership({ termId, ownershipId });
    return { termId, ownershipId };
  },
  {
    setSuccessOptions: ({ ownershipId }) => ({
      id: `Term-ownership-deleting-${ownershipId}`,
      message: `Term ownership successfully deleted.`,
    }),
  }
);
