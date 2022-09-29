import {
  Actions,
  Configuration,
  DataEntityApi,
  DataEntityApiAddDataEntityDataEntityGroupRequest,
  DataEntityApiAddDataEntityTermRequest,
  DataEntityApiCreateDataEntityGroupRequest,
  DataEntityApiCreateDataEntityTagsRelationsRequest,
  DataEntityApiDeleteDataEntityFromDataEntityGroupRequest,
  DataEntityApiDeleteDataEntityGroupRequest,
  DataEntityApiDeleteTermFromDataEntityRequest,
  DataEntityApiGetDataEntityDetailsRequest,
  DataEntityApiGetDataEntityPermissionsRequest,
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
  DataEntityUsageInfo,
  InternalDescription,
  InternalName,
  Tag,
  TermRef,
} from 'generated-sources';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { createAsyncThunk } from '@reduxjs/toolkit';

const apiClientConf = new Configuration(BASE_PARAMS);
const dataEntityApi = new DataEntityApi(apiClientConf);

export const fetchDataEntitiesClassesAndTypes = createAsyncThunk<
  DataEntityClassAndTypeDictionary,
  void
>(actions.fetchDataEntitiesClassesAndTypesActionType, async () =>
  dataEntityApi.getDataEntityClasses()
);

export const fetchDataEntityDetails = createAsyncThunk<
  DataEntityDetails,
  DataEntityApiGetDataEntityDetailsRequest
>(actions.fetchDataEntityDetailsActionType, async ({ dataEntityId }) =>
  dataEntityApi.getDataEntityDetails({
    dataEntityId,
  })
);

export const updateDataEntityTags = createAsyncThunk<
  { dataEntityId: number; tags: Array<Tag> },
  DataEntityApiCreateDataEntityTagsRelationsRequest
>(actions.updateDataEntityTagsActionType, async ({ dataEntityId, tagsFormData }) => {
  const tags = await dataEntityApi.createDataEntityTagsRelations({
    dataEntityId,
    tagsFormData,
  });
  return { dataEntityId, tags };
});

export const addDataEntityTerm = createAsyncThunk<
  { dataEntityId: number; term: TermRef },
  DataEntityApiAddDataEntityTermRequest
>(actions.addDataEntityTermActType, async ({ dataEntityId, dataEntityTermFormData }) => {
  const term = await dataEntityApi.addDataEntityTerm({
    dataEntityId,
    dataEntityTermFormData,
  });
  return { dataEntityId, term };
});

export const deleteDataEntityTerm = createAsyncThunk<
  { dataEntityId: number; termId: number },
  DataEntityApiDeleteTermFromDataEntityRequest
>(actions.deleteDataEntityTermActType, async ({ dataEntityId, termId }) => {
  await dataEntityApi.deleteTermFromDataEntity({
    dataEntityId,
    termId,
  });
  return { dataEntityId, termId };
});

export const updateDataEntityInternalDescription = createAsyncThunk<
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
  }
);

export const updateDataEntityInternalName = createAsyncThunk<
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
  }
);

export const fetchMyDataEntitiesList = createAsyncThunk<
  DataEntityRef[],
  DataEntityApiGetMyObjectsRequest
>(actions.fetchMyDataEntitiesActionType, async ({ page, size }) =>
  dataEntityApi.getMyObjects({
    page,
    size,
  })
);

export const fetchMyUpstreamDataEntitiesList = createAsyncThunk<
  DataEntityRef[],
  DataEntityApiGetMyObjectsWithUpstreamRequest
>(actions.fetchMyUpstreamDataEntitiesActionType, async ({ page, size }) =>
  dataEntityApi.getMyObjectsWithUpstream({
    page,
    size,
  })
);

export const fetchMyDownstreamDataEntitiesList = createAsyncThunk<
  DataEntityRef[],
  DataEntityApiGetMyObjectsWithDownstreamRequest
>(actions.fetchMyDownstreamDataEntitiesActionType, async ({ page, size }) =>
  dataEntityApi.getMyObjectsWithDownstream({
    page,
    size,
  })
);

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

export const addDataEntityToGroup = createAsyncThunk<
  DataEntityRef,
  DataEntityApiAddDataEntityDataEntityGroupRequest
>(
  actions.addDataEntityToGroupActionType,
  async ({ dataEntityId, dataEntityDataEntityGroupFormData }) =>
    dataEntityApi.addDataEntityDataEntityGroup({
      dataEntityId,
      dataEntityDataEntityGroupFormData,
    })
);

export const deleteDataEntityFromGroup = createAsyncThunk<
  void,
  DataEntityApiDeleteDataEntityFromDataEntityGroupRequest
>(
  actions.deleteDataEntityFromGroupActionType,
  async ({ dataEntityId, dataEntityGroupId }) => {
    await dataEntityApi.deleteDataEntityFromDataEntityGroup({
      dataEntityId,
      dataEntityGroupId,
    });
  }
);

export const fetchDataEntitiesUsageInfo = createAsyncThunk<DataEntityUsageInfo, void>(
  actions.fetchDataEntitiesUsageActionType,
  async () => dataEntityApi.getDataEntitiesUsage()
);

export const fetchDataEntityPermissions = createAsyncThunk<
  { dataEntityId: number; permissions: Actions },
  DataEntityApiGetDataEntityPermissionsRequest
>(actions.fetchDataEntityPermissionsActionType, async ({ dataEntityId }) => {
  const permissions = await dataEntityApi.getDataEntityPermissions({
    dataEntityId,
  });

  return { dataEntityId, permissions };
});
