import { createSelector } from '@reduxjs/toolkit';
import get from 'lodash/get';
import { DataEntitiesState, RootState } from 'redux/interfaces';
import {
  DataEntityClassNameEnum,
  DataEntityType,
} from 'generated-sources';
import * as actions from 'redux/actions';
import {
  createLegacyFetchingSelector,
  createStatusesSelector,
} from 'redux/selectors/loader-selectors';

const dataEntitiesState = ({
  dataEntities,
}: RootState): DataEntitiesState => dataEntities;

const getMyDataEntitiesFetchingStatus = createLegacyFetchingSelector(
  actions.fetchMyDataEntitiesAction
);

const getMyUpstreamDataEntitiesFetchingStatus =
  createLegacyFetchingSelector(actions.fetchMyUpstreamDataEntitiesAction);

const getMyDownstreamFetchingStatus = createLegacyFetchingSelector(
  actions.fetchMyDownstreamDataEntitiesAction
);

const getPopularDataEntitiesFetchingStatus = createLegacyFetchingSelector(
  actions.fetchPopularDataEntitiesAction
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

const dataEntityClassName = (
  _: RootState,
  entityClassName: DataEntityClassNameEnum
) => entityClassName;

export const getDataEntityTypesByClassName = createSelector(
  dataEntitiesState,
  dataEntityClassName,
  (dataEntities, entityClassName): Array<DataEntityType> =>
    Object.values(dataEntities.classesAndTypesDict.entityClasses).find(
      entityClass => entityClass.name === entityClassName
    )?.types || []
);

export const getDataEntityClassesList = createSelector(
  dataEntitiesState,
  dataEntities =>
    Object.values(dataEntities.classesAndTypesDict.entityClasses)
);

export const getDataEntityClassesDict = createSelector(
  dataEntitiesState,
  dataEntities => dataEntities.classesAndTypesDict.entityClasses
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
  createLegacyFetchingSelector(actions.fetchDataEntityDetailsAction);

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

const getDataEntityTagsUpdateStatus = createLegacyFetchingSelector(
  actions.updateDataEntityTagsAction
);

export const getDataEntityTagsUpdating = createSelector(
  getDataEntityTagsUpdateStatus,
  status => status === 'fetching'
);

const getDataEntityOwnerUpdateStatus = createLegacyFetchingSelector(
  actions.updateDataEntityOwnershipAction
);

export const getDataEntityOwnerUpdating = createSelector(
  getDataEntityOwnerUpdateStatus,
  status => status === 'fetching'
);

const getDataEntityInternalNameUpdateStatus = createLegacyFetchingSelector(
  actions.updateDataEntityInternalNameAction
);

export const getDataEntityInternalNameUpdating = createSelector(
  getDataEntityInternalNameUpdateStatus,
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

// data entity groups
export const getDataEntityGroupCreatingStatuses = createStatusesSelector(
  actions.createDataEntityGroupAction
);

export const getDataEntityGroupUpdatingStatuses = createStatusesSelector(
  actions.updateDataEntityGroupAction
);

export const getDataEntityGroupDeletingStatuses = createStatusesSelector(
  actions.deleteDataEntityGroupAction
);
