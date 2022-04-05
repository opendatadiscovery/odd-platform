import {
  DataEntityApi,
  Configuration,
  DataEntityRef,
  DataEntityDetails,
  DataEntityDetailsBaseObject,
  Tag,
  InternalDescription,
  DataEntityApiGetDataEntityDetailsRequest,
  DataEntityApiCreateDataEntityTagsRelationsRequest,
  DataEntityApiUpsertDataEntityInternalDescriptionRequest,
  DataEntityApiUpsertDataEntityInternalNameRequest,
  InternalName,
  DataEntityClassAndTypeDictionary,
  DataEntityApiGetMyObjectsRequest,
  DataEntityApiGetMyObjectsWithUpstreamRequest,
  DataEntityApiGetMyObjectsWithDownstreamRequest,
  DataEntityApiGetPopularRequest,
} from 'generated-sources';
import { PartialEntityUpdateParams } from 'redux/interfaces';
import { createThunk } from 'redux/thunks/base.thunk';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';

const apiClientConf = new Configuration(BASE_PARAMS);
const apiClient = new DataEntityApi(apiClientConf);

export const fetchDataEntitiesClassesAndTypes = createThunk<
  void,
  DataEntityClassAndTypeDictionary,
  DataEntityClassAndTypeDictionary
>(
  () => apiClient.getDataEntityClasses(),
  actions.fetchDataEntitiesClassesAndTypesAction,
  (response: DataEntityClassAndTypeDictionary) => response
);

export const fetchDataEntityDetails = createThunk<
  DataEntityApiGetDataEntityDetailsRequest,
  DataEntityDetails,
  DataEntityDetails
>(
  (params: DataEntityApiGetDataEntityDetailsRequest) =>
    apiClient.getDataEntityDetails(params),
  actions.fetchDataEntityAction,
  (response: DataEntityDetails) => response
);

export const updateDataEntityTags = createThunk<
  DataEntityApiCreateDataEntityTagsRelationsRequest,
  Tag[],
  PartialEntityUpdateParams<Tag[]>
>(
  (params: DataEntityApiCreateDataEntityTagsRelationsRequest) =>
    apiClient.createDataEntityTagsRelations(params),
  actions.updateDataEntityTagsAction,
  (
    response: Tag[],
    request: DataEntityApiCreateDataEntityTagsRelationsRequest
  ) => ({
    entityId: request.dataEntityId,
    value: response,
  })
);

export const updateDataEntityInternalDescription = createThunk<
  DataEntityApiUpsertDataEntityInternalDescriptionRequest,
  InternalDescription,
  PartialEntityUpdateParams<
    DataEntityDetailsBaseObject['internalDescription']
  >
>(
  (params: DataEntityApiUpsertDataEntityInternalDescriptionRequest) =>
    apiClient.upsertDataEntityInternalDescription(params),
  actions.updateDataEntityDescriptionAction,
  (
    response: InternalDescription,
    request: DataEntityApiUpsertDataEntityInternalDescriptionRequest
  ) => ({
    entityId: request.dataEntityId,
    value: response.internalDescription,
  })
);

export const updateDataEntityInternalName = createThunk<
  DataEntityApiUpsertDataEntityInternalNameRequest,
  InternalName,
  PartialEntityUpdateParams<InternalName>
>(
  (params: DataEntityApiUpsertDataEntityInternalNameRequest) =>
    apiClient.upsertDataEntityInternalName(params),
  actions.updateDataEntityInternalName,
  (
    response: InternalName,
    request: DataEntityApiUpsertDataEntityInternalNameRequest
  ) => ({
    entityId: request.dataEntityId,
    value: response,
  })
);

export const fetchMyDataEntitiesList = createThunk<
  DataEntityApiGetMyObjectsRequest,
  DataEntityRef[],
  DataEntityRef[]
>(
  (params: DataEntityApiGetMyObjectsRequest) =>
    apiClient.getMyObjects(params),
  actions.fetchMyDataEntitiesAction,
  (response: DataEntityRef[]) => response
);

export const fetchMyUpstreamDataEntitiesList = createThunk<
  DataEntityApiGetMyObjectsWithUpstreamRequest,
  DataEntityRef[],
  DataEntityRef[]
>(
  (params: DataEntityApiGetMyObjectsWithUpstreamRequest) =>
    apiClient.getMyObjectsWithUpstream(params),
  actions.fetchMyUpstreamDataEntitiesAction,
  (response: DataEntityRef[]) => response
);

export const fetchMyDownstreamDataEntitiesList = createThunk<
  DataEntityApiGetMyObjectsWithDownstreamRequest,
  DataEntityRef[],
  DataEntityRef[]
>(
  (params: DataEntityApiGetMyObjectsWithDownstreamRequest) =>
    apiClient.getMyObjectsWithDownstream(params),
  actions.fetchMyDownstreamDataEntitiesAction,
  (response: DataEntityRef[]) => response
);

export const fetchPopularDataEntitiesList = createThunk<
  DataEntityApiGetPopularRequest,
  DataEntityRef[],
  DataEntityRef[]
>(
  (params: DataEntityApiGetPopularRequest) => apiClient.getPopular(params),
  actions.fetchPopularDataEntitiesAction,
  (response: DataEntityRef[]) => response
);
