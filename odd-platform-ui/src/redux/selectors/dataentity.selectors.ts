import { createSelector } from 'reselect';
import get from 'lodash/get';
import { RootState, DataEntitiesState } from 'redux/interfaces';
import { DataEntityClassNameEnum } from 'generated-sources';
import {
  createFetchingSelector,
  createErrorSelector,
} from 'redux/selectors/loader-selectors';

const dataEntitiesState = ({
  dataEntities,
}: RootState): DataEntitiesState => dataEntities;

const getDataEntitiesListFetchingStatus = createFetchingSelector(
  'GET_DATA_ENTITIES'
);

const getMyDataEntitiesFetchingStatus = createFetchingSelector(
  'GET_MY_DATA_ENTITIES'
);

const getMyUpstreamDataEntitiesFetchingStatus = createFetchingSelector(
  'GET_MY_UPSTREAM_DATA_ENTITIES'
);

const getMyDownstreamFetchingStatus = createFetchingSelector(
  'GET_MY_DOWNSTREAM_DATA_ENTITIES'
);

const getPopularDataEntitiesFetchingStatus = createFetchingSelector(
  'GET_POPULAR_DATA_ENTITIES'
);

export const getMyDataEntitiesFetching = createSelector(
  getMyDataEntitiesFetchingStatus,
  status => status === 'fetching'
);

export const getMyUpstreamDataEntitiesFetching = createSelector(
  getMyUpstreamDataEntitiesFetchingStatus,
  status => status === 'fetching'
);

export const getMyDownstreamDataEntitiesFetching = createSelector(
  getMyDownstreamFetchingStatus,
  status => status === 'fetching'
);

export const getPopularDataEntitiesFetching = createSelector(
  getPopularDataEntitiesFetchingStatus,
  status => status === 'fetching'
);

export const getDataEntitiesListFetching = createSelector(
  getDataEntitiesListFetchingStatus,
  status => status === 'fetching'
);

export const getDataEntitiesListFetched = createSelector(
  getDataEntitiesListFetchingStatus,
  status => status === 'fetched'
);

const dataEntityClassName = (
  _: RootState,
  entityClassName: DataEntityClassNameEnum
) => entityClassName;

export const getDataEntityClassId = createSelector(
  dataEntitiesState,
  dataEntityClassName,
  (dataEntities, entityClassName) =>
    get(
      dataEntities,
      `classesAndTypesDict.entityClasses.${entityClassName}.id`
    )
);

export const getDataEntityClassesByName = createSelector(
  dataEntitiesState,
  dataEntities => dataEntities.classesAndTypesDict.entityClasses
);

export const getDataEntityClassesList = createSelector(
  dataEntitiesState,
  dataEntities =>
    Object.values(dataEntities.classesAndTypesDict.entityClasses)
);

export const getDataEntitiesList = createSelector(
  getDataEntitiesListFetched,
  dataEntitiesState,
  (isFetched, dataEntities) => {
    if (!isFetched) {
      return [];
    }
    return dataEntities.allIds.map(id => dataEntities.byId[id]);
  }
);

export const getMyEntities = createSelector(
  dataEntitiesState,
  dataEntities => dataEntities.my
);

export const getMyEntitiesDownstream = createSelector(
  dataEntitiesState,
  dataEntities => dataEntities.myDownstream
);

export const getMyEntitiesUpstream = createSelector(
  dataEntitiesState,
  dataEntities => dataEntities.myUpstream
);

export const getPopularEntities = createSelector(
  dataEntitiesState,
  dataEntities => dataEntities.popular
);
// Details
export const getDataEntityDetailsFetchingStatus =
  createFetchingSelector('GET_DATA_ENTITY');

export const getDataEntityDetailsFetchingError =
  createErrorSelector('GET_DATA_ENTITY');

export const getDataEntityDetailsFetching = createSelector(
  getDataEntityDetailsFetchingStatus,
  status => status === 'fetching'
);

export const getDataEntityDetailsFetched = createSelector(
  getDataEntityDetailsFetchingStatus,
  status => status === 'fetched'
);

export const getDataEntityDetailsErrorFetching = createSelector(
  getDataEntityDetailsFetchingStatus,
  status => status === 'errorFetching'
);

const getDataEntityTagsUpdateStatus = createFetchingSelector(
  'PUT_DATA_ENTITY_TAGS'
);

export const getDataEntityTagsUpdating = createSelector(
  getDataEntityTagsUpdateStatus,
  status => status === 'fetching'
);

const getDataEntityOwnerUpdateStatus = createFetchingSelector(
  'PUT_DATA_ENTITY_OWNER'
);

export const getDataEntityOwnerUpdating = createSelector(
  getDataEntityOwnerUpdateStatus,
  status => status === 'fetching'
);

const getDataEntityInternalNameUpdateStatus = createFetchingSelector(
  'PUT_DATA_ENTITY_INTERNAL_NAME'
);

export const getDataEntityInternalNameUpdating = createSelector(
  getDataEntityInternalNameUpdateStatus,
  status => status === 'fetching'
);

const getDataEntityTermUpdateStatus = createFetchingSelector(
  'PUT_DATA_ENTITY_TERM'
);

export const getDataEntityTermUpdating = createSelector(
  getDataEntityTermUpdateStatus,
  status => status === 'fetching'
);

export const getDataEntityId = (
  _: RootState,
  dataEntityId: number | string
) => dataEntityId;

export const getDataEntityDetails = createSelector(
  dataEntitiesState,
  getDataEntityId,
  (dataEntities, dataEntityId) => dataEntities.byId[dataEntityId]
);

export const getDataEntityTags = createSelector(
  dataEntitiesState,
  getDataEntityId,
  (dataEntities, dataEntityId) =>
    dataEntities.byId[dataEntityId]?.tags || []
);

export const getDataEntityTerms = createSelector(
  dataEntitiesState,
  getDataEntityId,
  (dataEntities, dataEntityId) =>
    dataEntities.byId[dataEntityId]?.terms || []
);

export const getDataEntityInternalDescription = createSelector(
  getDataEntityDetails,
  dataEntityDetails => dataEntityDetails.internalDescription
);

export const getDataEntityExternalDescription = createSelector(
  getDataEntityDetails,
  dataEntityDetails => dataEntityDetails.externalDescription
);

export const getDatasetVersions = createSelector(
  dataEntitiesState,
  getDataEntityId,
  (dataEntities, dataEntityId) =>
    dataEntities.byId[dataEntityId]?.versionList
);

export const getDatasetStats = createSelector(
  dataEntitiesState,
  getDataEntityId,
  (dataEntities, dataEntityId) => dataEntities.byId[dataEntityId]?.stats
);

export const getDataEntityInternalName = createSelector(
  dataEntitiesState,
  getDataEntityId,
  (dataEntities, dataEntityId) =>
    dataEntities.byId[dataEntityId]?.internalName
);

export const getDataEntityIsDataset = createSelector(
  dataEntitiesState,
  getDataEntityId,
  (dataEntities, dataEntityId) =>
    !!dataEntities.byId[dataEntityId]?.entityClasses?.find(
      entityClass => entityClass.name === DataEntityClassNameEnum.SET
    )
);

export const getDataEntityIsQualityTest = createSelector(
  dataEntitiesState,
  getDataEntityId,
  (dataEntities, dataEntityId) =>
    !!dataEntities.byId[dataEntityId]?.entityClasses?.find(
      entityClass =>
        entityClass.name === DataEntityClassNameEnum.QUALITY_TEST
    )
);
