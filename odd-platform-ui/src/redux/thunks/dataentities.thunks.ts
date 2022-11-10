import {
  Configuration,
  DataEntityApi,
  type DataEntityApiAddDataEntityDataEntityGroupRequest,
  type DataEntityApiAddDataEntityTermRequest,
  type DataEntityApiCreateDataEntityGroupRequest,
  type DataEntityApiCreateDataEntityTagsRelationsRequest,
  type DataEntityApiDeleteDataEntityFromDataEntityGroupRequest,
  type DataEntityApiDeleteDataEntityGroupRequest,
  type DataEntityApiDeleteTermFromDataEntityRequest,
  type DataEntityApiGetDataEntityDetailsRequest,
  type DataEntityApiGetMyObjectsRequest,
  type DataEntityApiGetMyObjectsWithDownstreamRequest,
  type DataEntityApiGetMyObjectsWithUpstreamRequest,
  type DataEntityApiGetPopularRequest,
  type DataEntityApiUpdateDataEntityGroupRequest,
  type DataEntityApiUpsertDataEntityInternalDescriptionRequest,
  type DataEntityApiUpsertDataEntityInternalNameRequest,
  type DataEntityClassAndTypeDictionary,
  type DataEntityDetails,
  type DataEntityRef,
  type DataEntityUsageInfo,
  type InternalDescription,
  type InternalName,
  type Tag,
  type TermRef,
} from 'generated-sources';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';

const apiClientConf = new Configuration(BASE_PARAMS);
const dataEntityApi = new DataEntityApi(apiClientConf);

export const fetchDataEntitiesClassesAndTypes = handleResponseAsyncThunk<
  DataEntityClassAndTypeDictionary,
  void
>(
  actions.fetchDataEntitiesClassesAndTypesActionType,
  async () => await dataEntityApi.getDataEntityClasses(),
  {}
);

export const fetchDataEntityDetails = handleResponseAsyncThunk<
  DataEntityDetails,
  DataEntityApiGetDataEntityDetailsRequest
>(
  actions.fetchDataEntityDetailsActionType,
  async ({ dataEntityId }) => await dataEntityApi.getDataEntityDetails({ dataEntityId }),
  { switchOffErrorMessage: true }
);

export const updateDataEntityTags = handleResponseAsyncThunk<
  { dataEntityId: number; tags: Array<Tag> },
  DataEntityApiCreateDataEntityTagsRelationsRequest
>(
  actions.updateDataEntityTagsActionType,
  async ({ dataEntityId, tagsFormData }) => {
    const tags = await dataEntityApi.createDataEntityTagsRelations({
      dataEntityId,
      tagsFormData,
    });
    return { dataEntityId, tags };
  },
  {
    setSuccessOptions: ({ tagsFormData }) => ({
      id: `DataEntity-tags-updating-${tagsFormData.tagNameList.length}`,
      message: `Data entity tags successfully updated.`,
    }),
  }
);

export const addDataEntityTerm = handleResponseAsyncThunk<
  { dataEntityId: number; term: TermRef },
  DataEntityApiAddDataEntityTermRequest
>(
  actions.addDataEntityTermActType,
  async ({ dataEntityId, dataEntityTermFormData }) => {
    const term = await dataEntityApi.addDataEntityTerm({
      dataEntityId,
      dataEntityTermFormData,
    });
    return { dataEntityId, term };
  },
  {
    setSuccessOptions: ({ dataEntityTermFormData }) => ({
      id: `DataEntity-term-updating-${dataEntityTermFormData.termId}`,
      message: `Data entity term successfully added.`,
    }),
  }
);

export const deleteDataEntityTerm = handleResponseAsyncThunk<
  { dataEntityId: number; termId: number },
  DataEntityApiDeleteTermFromDataEntityRequest
>(
  actions.deleteDataEntityTermActType,
  async ({ dataEntityId, termId }) => {
    await dataEntityApi.deleteTermFromDataEntity({
      dataEntityId,
      termId,
    });
    return { dataEntityId, termId };
  },
  {
    setSuccessOptions: ({ termId }) => ({
      id: `DataEntity-term-deleting-${termId}`,
      message: `Data entity term successfully deleted.`,
    }),
  }
);

export const updateDataEntityInternalDescription = handleResponseAsyncThunk<
  {
    dataEntityId: number;
    internalDescription: InternalDescription['internalDescription'];
  },
  DataEntityApiUpsertDataEntityInternalDescriptionRequest
>(
  actions.updateDataEntityInternalDescriptionActionType,
  async ({ dataEntityId, internalDescriptionFormData }) => {
    const { internalDescription } =
      await dataEntityApi.upsertDataEntityInternalDescription({
        dataEntityId,
        internalDescriptionFormData,
      });
    return { dataEntityId, internalDescription };
  },
  {
    setSuccessOptions: ({ internalDescriptionFormData: { internalDescription } }) => ({
      id: `DataEntity-description-${internalDescription}`,
      message: `Data entity description successfully updated.`,
    }),
  }
);

export const updateDataEntityInternalName = handleResponseAsyncThunk<
  { dataEntityId: number; internalName: InternalName['internalName'] },
  DataEntityApiUpsertDataEntityInternalNameRequest
>(
  actions.updateDataEntityInternalNameActionType,
  async ({ dataEntityId, internalNameFormData }) => {
    const { internalName } = await dataEntityApi.upsertDataEntityInternalName({
      dataEntityId,
      internalNameFormData,
    });
    return { dataEntityId, internalName };
  },
  {
    setSuccessOptions: ({ internalNameFormData: { internalName } }) => ({
      id: `DataEntity-internalName-${internalName}`,
      message: `Data entity internal name successfully updated.`,
    }),
  }
);
// TODO handle
export const fetchMyDataEntitiesList = createAsyncThunk<
  DataEntityRef[],
  DataEntityApiGetMyObjectsRequest
>(actions.fetchMyDataEntitiesActionType, async ({ page, size }) =>
  dataEntityApi.getMyObjects({
    page,
    size,
  })
);
// TODO handle
export const fetchMyUpstreamDataEntitiesList = createAsyncThunk<
  DataEntityRef[],
  DataEntityApiGetMyObjectsWithUpstreamRequest
>(actions.fetchMyUpstreamDataEntitiesActionType, async ({ page, size }) =>
  dataEntityApi.getMyObjectsWithUpstream({
    page,
    size,
  })
);
// TODO handle
export const fetchMyDownstreamDataEntitiesList = createAsyncThunk<
  DataEntityRef[],
  DataEntityApiGetMyObjectsWithDownstreamRequest
>(actions.fetchMyDownstreamDataEntitiesActionType, async ({ page, size }) =>
  dataEntityApi.getMyObjectsWithDownstream({
    page,
    size,
  })
);
// TODO handle
export const fetchPopularDataEntitiesList = createAsyncThunk<
  DataEntityRef[],
  DataEntityApiGetPopularRequest
>(actions.fetchPopularDataEntitiesActionType, async ({ page, size }) =>
  dataEntityApi.getPopular({
    page,
    size,
  })
);

export const createDataEntityGroup = createAsyncThunk<
  DataEntityRef,
  DataEntityApiCreateDataEntityGroupRequest
>(actions.createDataEntityGroupActionType, async ({ dataEntityGroupFormData }) =>
  dataEntityApi.createDataEntityGroup({ dataEntityGroupFormData })
);

export const updateDataEntityGroup = createAsyncThunk<
  DataEntityRef,
  DataEntityApiUpdateDataEntityGroupRequest
>(
  actions.updateDataEntityGroupActionType,
  async ({ dataEntityGroupId, dataEntityGroupFormData }) =>
    dataEntityApi.updateDataEntityGroup({
      dataEntityGroupId,
      dataEntityGroupFormData,
    })
);

export const deleteDataEntityGroup = createAsyncThunk<
  number,
  DataEntityApiDeleteDataEntityGroupRequest
>(actions.deleteDataEntityGroupActionType, async ({ dataEntityGroupId }) => {
  await dataEntityApi.deleteDataEntityGroup({
    dataEntityGroupId,
  });
  return dataEntityGroupId;
});

export const addDataEntityToGroup = handleResponseAsyncThunk<
  DataEntityRef,
  DataEntityApiAddDataEntityDataEntityGroupRequest
>(
  actions.addDataEntityToGroupActionType,
  async ({ dataEntityId, dataEntityDataEntityGroupFormData }) =>
    await dataEntityApi.addDataEntityDataEntityGroup({
      dataEntityId,
      dataEntityDataEntityGroupFormData,
    }),
  {
    setSuccessOptions: ({
      dataEntityDataEntityGroupFormData: { dataEntityGroupId },
    }) => ({
      id: `DataEntity-group-updating-${dataEntityGroupId}`,
      message: `Data entity successfully added to group.`,
    }),
  }
);

export const deleteDataEntityFromGroup = handleResponseAsyncThunk<
  void,
  DataEntityApiDeleteDataEntityFromDataEntityGroupRequest
>(
  actions.deleteDataEntityFromGroupActionType,
  async ({ dataEntityId, dataEntityGroupId }) => {
    await dataEntityApi.deleteDataEntityFromDataEntityGroup({
      dataEntityId,
      dataEntityGroupId,
    });
  },
  {
    setSuccessOptions: ({ dataEntityGroupId }) => ({
      id: `DataEntity-group-deleting-${dataEntityGroupId}`,
      message: `Data entity successfully deleted from group.`,
    }),
  }
);
// TODO handle
export const fetchDataEntitiesUsageInfo = createAsyncThunk<DataEntityUsageInfo, void>(
  actions.fetchDataEntitiesUsageActionType,
  async () => dataEntityApi.getDataEntitiesUsage()
);
