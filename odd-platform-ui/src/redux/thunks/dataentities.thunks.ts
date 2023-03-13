import type {
  DataEntityApiAddDataEntityDataEntityGroupRequest,
  DataEntityApiAddDataEntityTermRequest,
  DataEntityApiCreateDataEntityGroupRequest,
  DataEntityApiCreateDataEntityTagsRelationsRequest,
  DataEntityApiDeleteDataEntityFromDataEntityGroupRequest,
  DataEntityApiDeleteDataEntityGroupRequest,
  DataEntityApiDeleteTermFromDataEntityRequest,
  DataEntityApiGetDataEntityDetailsRequest,
  DataEntityApiGetMyObjectsRequest,
  DataEntityApiGetMyObjectsWithDownstreamRequest,
  DataEntityApiGetMyObjectsWithUpstreamRequest,
  DataEntityApiGetPopularRequest,
  DataEntityApiUpdateDataEntityGroupRequest,
  DataEntityApiUpsertDataEntityInternalDescriptionRequest,
  DataEntityApiUpsertDataEntityInternalNameRequest,
  DataEntityClassAndTypeDictionary,
  DataEntityDetails,
  DataEntityRef,
  InternalDescription,
  InternalName,
  Tag,
  TermRef,
} from 'generated-sources';
import * as actions from 'redux/actions';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';
import { dataEntityApi } from 'lib/api';

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

export const fetchMyDataEntitiesList = handleResponseAsyncThunk<
  DataEntityRef[],
  DataEntityApiGetMyObjectsRequest
>(
  actions.fetchMyDataEntitiesActionType,
  async ({ page, size }) => await dataEntityApi.getMyObjects({ page, size }),
  {}
);

export const fetchMyUpstreamDataEntitiesList = handleResponseAsyncThunk<
  DataEntityRef[],
  DataEntityApiGetMyObjectsWithUpstreamRequest
>(
  actions.fetchMyUpstreamDataEntitiesActionType,
  async ({ page, size }) => await dataEntityApi.getMyObjectsWithUpstream({ page, size }),
  {}
);

export const fetchMyDownstreamDataEntitiesList = handleResponseAsyncThunk<
  DataEntityRef[],
  DataEntityApiGetMyObjectsWithDownstreamRequest
>(
  actions.fetchMyDownstreamDataEntitiesActionType,
  async ({ page, size }) =>
    await dataEntityApi.getMyObjectsWithDownstream({ page, size }),
  {}
);

export const fetchPopularDataEntitiesList = handleResponseAsyncThunk<
  DataEntityRef[],
  DataEntityApiGetPopularRequest
>(
  actions.fetchPopularDataEntitiesActionType,
  async ({ page, size }) => await dataEntityApi.getPopular({ page, size }),
  {}
);

export const createDataEntityGroup = handleResponseAsyncThunk<
  DataEntityRef,
  DataEntityApiCreateDataEntityGroupRequest
>(
  actions.createDataEntityGroupActionType,
  async ({ dataEntityGroupFormData }) =>
    await dataEntityApi.createDataEntityGroup({ dataEntityGroupFormData }),
  {
    setSuccessOptions: ({ dataEntityGroupFormData: { name } }) => ({
      id: `DataEntityGroup-creating-${name}`,
      message: `Data entity group ${name} successfully created.`,
    }),
  }
);

export const updateDataEntityGroup = handleResponseAsyncThunk<
  DataEntityRef,
  DataEntityApiUpdateDataEntityGroupRequest
>(
  actions.updateDataEntityGroupActionType,
  async ({ dataEntityGroupId, dataEntityGroupFormData }) =>
    await dataEntityApi.updateDataEntityGroup({
      dataEntityGroupId,
      dataEntityGroupFormData,
    }),
  {
    setSuccessOptions: ({ dataEntityGroupFormData: { name } }) => ({
      id: `DataEntityGroup-updating-${name}`,
      message: `Data entity group ${name} successfully updated.`,
    }),
  }
);

export const deleteDataEntityGroup = handleResponseAsyncThunk<
  number,
  DataEntityApiDeleteDataEntityGroupRequest
>(
  actions.deleteDataEntityGroupActionType,
  async ({ dataEntityGroupId }) => {
    await dataEntityApi.deleteDataEntityGroup({ dataEntityGroupId });
    return dataEntityGroupId;
  },
  {
    setSuccessOptions: ({ dataEntityGroupId }) => ({
      id: `DataEntityGroup-deleting-${dataEntityGroupId}`,
      message: `Data entity group successfully deleted.`,
    }),
  }
);

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
