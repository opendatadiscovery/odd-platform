import { createAsyncAction } from 'typesafe-actions';
import {
  DataEntityDetails,
  Tag,
  DataEntityDetailsBaseObject,
  InternalName,
  DataEntityTypeDictionary,
  DataEntityRef,
} from 'generated-sources';
import { PartialEntityUpdateParams, ErrorState } from 'redux/interfaces';

export const fetchDataEntitiesTypesAction = createAsyncAction(
  'GET_DATA_ENTITIES_TYPES__REQUEST',
  'GET_DATA_ENTITIES_TYPES__SUCCESS',
  'GET_DATA_ENTITIES_TYPES__FAILURE'
)<undefined, DataEntityTypeDictionary, ErrorState>();

export const fetchDataEntityAction = createAsyncAction(
  'GET_DATA_ENTITY__REQUEST',
  'GET_DATA_ENTITY__SUCCESS',
  'GET_DATA_ENTITY__FAILURE'
)<undefined, DataEntityDetails, ErrorState>();

export const updateDataEntityTagsAction = createAsyncAction(
  'PUT_DATA_ENTITY_TAGS__REQUEST',
  'PUT_DATA_ENTITY_TAGS__SUCCESS',
  'PUT_DATA_ENTITY_TAGS__FAILURE'
)<undefined, PartialEntityUpdateParams<Tag[]>, ErrorState>();

export const updateDataEntityDescriptionAction = createAsyncAction(
  'PUT_DATA_ENTITY_INTERNAL_DESCRIPTION__REQUEST',
  'PUT_DATA_ENTITY_INTERNAL_DESCRIPTION__SUCCESS',
  'PUT_DATA_ENTITY_INTERNAL_DESCRIPTION__FAILURE'
)<
  undefined,
  PartialEntityUpdateParams<
    DataEntityDetailsBaseObject['internalDescription']
  >,
  ErrorState
>();

export const updateDataEntityInternalName = createAsyncAction(
  'PUT_DATA_ENTITY_INTERNAL_NAME__REQUEST',
  'PUT_DATA_ENTITY_INTERNAL_NAME__SUCCESS',
  'PUT_DATA_ENTITY_INTERNAL_NAME__FAILURE'
)<undefined, PartialEntityUpdateParams<InternalName>, ErrorState>();

export const fetchMyDataEntitiesAction = createAsyncAction(
  'GET_MY_DATA_ENTITIES__REQUEST',
  'GET_MY_DATA_ENTITIES__SUCCESS',
  'GET_MY_DATA_ENTITIES__FAILURE'
)<undefined, DataEntityRef[], ErrorState>();

export const fetchMyUpstreamDataEntitiesAction = createAsyncAction(
  'GET_MY_UPSTREAM_DATA_ENTITIES__REQUEST',
  'GET_MY_UPSTREAM_DATA_ENTITIES__SUCCESS',
  'GET_MY_UPSTREAM_DATA_ENTITIES__FAILURE'
)<undefined, DataEntityRef[], ErrorState>();

export const fetchMyDownstreamDataEntitiesAction = createAsyncAction(
  'GET_MY_DOWNSTREAM_DATA_ENTITIES__REQUEST',
  'GET_MY_DOWNSTREAM_DATA_ENTITIES__SUCCESS',
  'GET_MY_DOWNSTREAM_DATA_ENTITIES__FAILURE'
)<undefined, DataEntityRef[], ErrorState>();

export const fetchPopularDataEntitiesAction = createAsyncAction(
  'GET_POPULAR_DATA_ENTITIES__REQUEST',
  'GET_POPULAR_DATA_ENTITIES__SUCCESS',
  'GET_POPULAR_DATA_ENTITIES__FAILURE'
)<undefined, DataEntityRef[], ErrorState>();
