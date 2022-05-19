import {
  Configuration,
  DataEntityApi,
  DataEntityApiAddDataEntityTermRequest,
  DataEntityApiCreateDataEntityGroupRequest,
  DataEntityApiCreateDataEntityTagsRelationsRequest,
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
import { BASE_PARAMS } from 'lib/constants';
import { createAsyncThunk } from '@reduxjs/toolkit';

const apiClientConf = new Configuration(BASE_PARAMS);
const dataEntityApi = new DataEntityApi(apiClientConf);

export const fetchDataEntitiesClassesAndTypes = createAsyncThunk<
  DataEntityClassAndTypeDictionary,
  void
>(actions.fetchDataEntitiesClassesAndTypesAction, async () =>
  dataEntityApi.getDataEntityClasses()
);

export const fetchDataEntityDetails = createAsyncThunk<
  DataEntityDetails,
  DataEntityApiGetDataEntityDetailsRequest
>(actions.fetchDataEntityDetailsAction, async ({ dataEntityId }) =>
  dataEntityApi.getDataEntityDetails({
    dataEntityId,
  })
);

export const updateDataEntityTags = createAsyncThunk<
  { dataEntityId: number; tags: Array<Tag> },
  DataEntityApiCreateDataEntityTagsRelationsRequest
>(
  actions.updateDataEntityTagsAction,
  async ({ dataEntityId, tagsFormData }) => {
    const tags = await dataEntityApi.createDataEntityTagsRelations({
      dataEntityId,
      tagsFormData,
    });
    return { dataEntityId, tags };
  }
);

export const addDataEntityTerm = createAsyncThunk<
  { dataEntityId: number; term: TermRef },
  DataEntityApiAddDataEntityTermRequest
>(
  actions.addDataEntityTermAction,
  async ({ dataEntityId, dataEntityTermFormData }) => {
    const term = await dataEntityApi.addDataEntityTerm({
      dataEntityId,
      dataEntityTermFormData,
    });
    return { dataEntityId, term };
  }
);

export const deleteDataEntityTerm = createAsyncThunk<
  { dataEntityId: number; termId: number },
  DataEntityApiDeleteTermFromDataEntityRequest
>(actions.deleteDataEntityTermAction, async ({ dataEntityId, termId }) => {
  const term = await dataEntityApi.deleteTermFromDataEntity({
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
  actions.updateDataEntityInternalDescriptionAction,
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
  {
    dataEntityId: number;
    internalName: InternalName['internalName'];
  },
  DataEntityApiUpsertDataEntityInternalNameRequest
>(
  actions.updateDataEntityInternalNameAction,
  async ({ dataEntityId, internalNameFormData }) => {
    const { internalName } =
      await dataEntityApi.upsertDataEntityInternalName({
        dataEntityId,
        internalNameFormData,
      });
    return { dataEntityId, internalName };
  }
);

export const fetchMyDataEntitiesList = createAsyncThunk<
  DataEntityRef[],
  DataEntityApiGetMyObjectsRequest
>(actions.fetchMyDataEntitiesAction, async ({ page, size }) =>
  dataEntityApi.getMyObjects({
    page,
    size,
  })
);

export const fetchMyUpstreamDataEntitiesList = createAsyncThunk<
  DataEntityRef[],
  DataEntityApiGetMyObjectsWithUpstreamRequest
>(actions.fetchMyUpstreamDataEntitiesAction, async ({ page, size }) =>
  dataEntityApi.getMyObjectsWithUpstream({
    page,
    size,
  })
);

export const fetchMyDownstreamDataEntitiesList = createAsyncThunk<
  DataEntityRef[],
  DataEntityApiGetMyObjectsWithDownstreamRequest
>(actions.fetchMyDownstreamDataEntitiesAction, async ({ page, size }) =>
  dataEntityApi.getMyObjectsWithDownstream({
    page,
    size,
  })
);

export const fetchPopularDataEntitiesList = createAsyncThunk<
  DataEntityRef[],
  DataEntityApiGetPopularRequest
>(actions.fetchPopularDataEntitiesAction, async ({ page, size }) =>
  dataEntityApi.getPopular({
    page,
    size,
  })
);

// data entity groups
export const createDataEntityGroup = createAsyncThunk<
  DataEntityRef,
  DataEntityApiCreateDataEntityGroupRequest
>(
  actions.createDataEntityGroupAction,
  async ({ dataEntityGroupFormData }) => {
    const dataEntityGroupRef = await dataEntityApi.createDataEntityGroup({
      dataEntityGroupFormData,
    });
    return dataEntityGroupRef;
  }
);

export const updateDataEntityGroup = createAsyncThunk<
  DataEntityRef,
  DataEntityApiUpdateDataEntityGroupRequest
>(
  actions.updateDataEntityGroupAction,
  async ({ dataEntityGroupId, dataEntityGroupFormData }) => {
    const dataEntityGroupRef = await dataEntityApi.updateDataEntityGroup({
      dataEntityGroupId,
      dataEntityGroupFormData,
    });
    return dataEntityGroupRef;
  }
);

export const deleteDataEntityGroup = createAsyncThunk<
  number,
  DataEntityApiDeleteDataEntityGroupRequest
>(actions.deleteDataEntityGroupAction, async ({ dataEntityGroupId }) => {
  await dataEntityApi.deleteDataEntityGroup({
    dataEntityGroupId,
  });
  return dataEntityGroupId;
});
