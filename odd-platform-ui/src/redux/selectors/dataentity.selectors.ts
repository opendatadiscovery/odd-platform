import { createSelector } from '@reduxjs/toolkit';
import { DataEntitiesState, RootState } from 'redux/interfaces';
import {
  DataEntityClass,
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

export const getDataEntitiesUsageTotalCount = createSelector(
  dataEntitiesState,
  dataEntities => dataEntities.dataEntityUsageInfo.totalCount
);

export const getDataEntitiesUsageUnfilledCount = createSelector(
  dataEntitiesState,
  dataEntities => dataEntities.dataEntityUsageInfo.unfilledCount
);

export const getDataEntityClassesInfo = createSelector(
  dataEntitiesState,
  dataEntities => dataEntities.dataEntityUsageInfo.dataEntityClassesInfo
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

export const getIsDataEntityBelongsToClass = (
  dataEntityId: number | string
) =>
  createSelector(dataEntitiesState, dataEntities => {
    const dataEntityClasses =
      dataEntities.byId[dataEntityId]?.entityClasses;
    const isClassesEquals =
      (desiredClass: DataEntityClassNameEnum) =>
      (entityClass: DataEntityClass) =>
        entityClass.name === desiredClass;

    const isDataset = dataEntityClasses?.some(
      isClassesEquals(DataEntityClassNameEnum.SET)
    );

    const isQualityTest = dataEntityClasses?.some(
      isClassesEquals(DataEntityClassNameEnum.QUALITY_TEST)
    );

    const isTransformer = dataEntityClasses?.some(
      isClassesEquals(DataEntityClassNameEnum.TRANSFORMER)
    );

    return { isDataset, isQualityTest, isTransformer };
  });

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

export const getDataEntityAddToGroupStatuses = createStatusesSelector(
  actions.addDataEntityToGroupActionType
);

export const getDataEntityDeleteFromGroupStatuses = createStatusesSelector(
  actions.deleteDataEntityFromGroupActionType
);
