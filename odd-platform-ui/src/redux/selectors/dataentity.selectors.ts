import { createSelector } from '@reduxjs/toolkit';
import { DataEntitiesState, RootState } from 'redux/interfaces';
import {
  DataEntityClass,
  DataEntityClassNameEnum,
  DataEntityType,
} from 'generated-sources';
import * as actions from 'redux/actions';
import { createStatusesSelector } from 'redux/selectors';

const dataEntitiesState = ({
  dataEntities,
}: RootState): DataEntitiesState => dataEntities;

export const getDataEntityId = (
  _: RootState,
  dataEntityId: number | string
) => dataEntityId;

export const getDataEntityTypesByClassName = (
  entityClassName: DataEntityClassNameEnum
) =>
  createSelector(
    dataEntitiesState,
    (dataEntities): Array<DataEntityType> =>
      Object.values(dataEntities.classesAndTypesDict.entityClasses).find(
        entityClass => entityClass.name === entityClassName
      )?.types || []
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

export const getDataEntityClassesUsageInfo = createSelector(
  dataEntitiesState,
  dataEntities => dataEntities.dataEntityUsageInfo.dataEntityClassesInfo
);

// details
export const getDataEntityDetails = (dataEntityId: number) =>
  createSelector(
    dataEntitiesState,
    dataEntities => dataEntities.byId[dataEntityId]
  );

export const getDataEntityInternalName = (dataEntityId: number) =>
  createSelector(
    dataEntitiesState,
    dataEntities => dataEntities.byId[dataEntityId]?.internalName
  );

export const getDataEntityTags = (dataEntityId: number) =>
  createSelector(
    dataEntitiesState,
    dataEntities => dataEntities.byId[dataEntityId]?.tags || []
  );

export const getDataEntityInternalDescription = (dataEntityId: number) =>
  createSelector(
    getDataEntityDetails(dataEntityId),
    dataEntityDetails => dataEntityDetails.internalDescription
  );

export const getDataEntityExternalDescription = (dataEntityId: number) =>
  createSelector(
    getDataEntityDetails(dataEntityId),
    dataEntityDetails => dataEntityDetails.externalDescription
  );

// datasets
export const getDatasetVersions = (dataEntityId: number) =>
  createSelector(
    dataEntitiesState,
    dataEntities => dataEntities.byId[dataEntityId]?.versionList
  );

export const getDatasetStats = (dataEntityId: number) =>
  createSelector(
    dataEntitiesState,
    dataEntities => dataEntities.byId[dataEntityId]?.stats
  );

// statuses selectors
export const getMyDataEntitiesFetchingStatuses = createStatusesSelector(
  actions.fetchMyDataEntitiesActionType
);

export const getMyUpstreamDataEntitiesFetchingStatuses =
  createStatusesSelector(actions.fetchMyUpstreamDataEntitiesActionType);

export const getMyDownstreamFetchingStatuses = createStatusesSelector(
  actions.fetchMyDownstreamDataEntitiesActionType
);

export const getPopularDataEntitiesFetchingStatuses =
  createStatusesSelector(actions.fetchPopularDataEntitiesActionType);

export const getDataEntityDetailsFetchingStatuses = createStatusesSelector(
  actions.fetchDataEntityDetailsActionType
);

export const getDataEntityInternalNameUpdatingStatuses =
  createStatusesSelector(actions.updateDataEntityInternalNameActionType);

export const getDataEntityTagsUpdatingStatuses = createStatusesSelector(
  actions.updateDataEntityTagsActionType
);

export const getDataEntityOwnerUpdatingStatuses = createStatusesSelector(
  actions.updateDataEntityOwnershipAction
);

export const getDataEntityGroupCreatingStatuses = createStatusesSelector(
  actions.createDataEntityGroupActionType
);

export const getDataEntityGroupUpdatingStatuses = createStatusesSelector(
  actions.updateDataEntityGroupActionType
);

export const getDataEntityGroupDeletingStatuses = createStatusesSelector(
  actions.deleteDataEntityGroupActionType
);

export const getDataEntityAddToGroupStatuses = createStatusesSelector(
  actions.addDataEntityToGroupActionType
);

export const getDataEntityDeleteFromGroupStatuses = createStatusesSelector(
  actions.deleteDataEntityFromGroupActionType
);

export const getDataEntityPermissionsFetchingStatuses =
  createStatusesSelector(actions.fetchDataEntityPermissionsActionType);
