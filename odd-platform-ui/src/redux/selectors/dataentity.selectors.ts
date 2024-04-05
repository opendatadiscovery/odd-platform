import { createSelector } from '@reduxjs/toolkit';
import type { DataEntitiesState, RootState } from 'redux/interfaces';
import type { DataEntityClass, DataEntityType } from 'generated-sources';
import { DataEntityClassNameEnum } from 'generated-sources';
import * as actions from 'redux/actions';
import {
  createErrorSelector,
  createStatusesSelector,
} from 'redux/selectors/loader-selectors';
import { emptyArr, emptyObj } from 'lib/constants';
import { isEntityStatusDeleted } from 'lib/helpers';

const dataEntitiesState = ({ dataEntities }: RootState): DataEntitiesState =>
  dataEntities;

export const getDataEntityTypesByClassName = (entityClassName: DataEntityClassNameEnum) =>
  createSelector(
    dataEntitiesState,
    (dataEntities): Array<DataEntityType> =>
      Object.values(dataEntities.classesAndTypesDict.entityClasses).find(
        entityClass => entityClass.name === entityClassName
      )?.types || []
  );

export const getIsDataEntityBelongsToClass = (dataEntityId: number | string) =>
  createSelector(dataEntitiesState, dataEntities => {
    const dataEntityClasses = dataEntities.byId[dataEntityId]?.entityClasses;
    const isClassesEquals =
      (desiredClass: DataEntityClassNameEnum) => (entityClass: DataEntityClass) =>
        entityClass.name === desiredClass;

    const isDataset =
      dataEntityClasses?.some(isClassesEquals(DataEntityClassNameEnum.SET)) ?? false;

    const isQualityTest =
      dataEntityClasses?.some(isClassesEquals(DataEntityClassNameEnum.QUALITY_TEST)) ??
      false;

    const isTransformer =
      dataEntityClasses?.some(isClassesEquals(DataEntityClassNameEnum.TRANSFORMER)) ??
      false;

    const isDEG =
      dataEntityClasses?.some(isClassesEquals(DataEntityClassNameEnum.ENTITY_GROUP)) ??
      false;

    const isRelationship =
      dataEntityClasses?.some(isClassesEquals(DataEntityClassNameEnum.RELATIONSHIP)) ??
      false;

    return { isDataset, isQualityTest, isTransformer, isDEG, isRelationship };
  });

export const getDataEntityClassesList = createSelector(
  dataEntitiesState,
  (dataEntities): DataEntityClass[] =>
    Object.values(dataEntities.classesAndTypesDict.entityClasses)
);

export const getIsEntityStatusDeleted = (dataEntityId: number | string) =>
  createSelector(dataEntitiesState, (dataEntities): boolean => {
    const entityStatus = dataEntities.byId[dataEntityId]?.status;

    return isEntityStatusDeleted(entityStatus);
  });

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

// details
export const getDataEntityDetails = (dataEntityId: number) =>
  createSelector(
    dataEntitiesState,
    dataEntities => dataEntities.byId[dataEntityId] || emptyObj
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
    dataEntities => dataEntities.byId[dataEntityId]?.versionList || emptyArr
  );

export const getDatasetStats = (dataEntityId: number) =>
  createSelector(
    dataEntitiesState,
    dataEntities => dataEntities.byId[dataEntityId]?.stats
  );

export const getDatasetLookupTableId = (dataEntityId: number) =>
  createSelector(
    dataEntitiesState,
    dataEntities => dataEntities.byId[dataEntityId]?.lookupTableId
  );

// statuses selectors
export const getMyDataEntitiesFetchingStatuses = createStatusesSelector(
  actions.fetchMyDataEntitiesActionType
);

export const getMyUpstreamDataEntitiesFetchingStatuses = createStatusesSelector(
  actions.fetchMyUpstreamDataEntitiesActionType
);

export const getMyDownstreamFetchingStatuses = createStatusesSelector(
  actions.fetchMyDownstreamDataEntitiesActionType
);

export const getPopularDataEntitiesFetchingStatuses = createStatusesSelector(
  actions.fetchPopularDataEntitiesActionType
);

export const getDataEntityDetailsFetchingStatuses = createStatusesSelector(
  actions.fetchDataEntityDetailsActionType
);
export const getDataEntityDetailsFetchingError = createErrorSelector(
  actions.fetchDataEntityDetailsActionType
);

export const getDataEntityInternalNameUpdatingStatuses = createStatusesSelector(
  actions.updateDataEntityInternalNameActionType
);

export const getDataEntityTagsUpdatingStatuses = createStatusesSelector(
  actions.updateDataEntityTagsActionType
);

export const getDataEntityOwnerUpdatingStatuses = createStatusesSelector(
  actions.updateDataEntityOwnershipAction
);

export const getDataEntityOwnerCreatingStatuses = createStatusesSelector(
  actions.createDataEntityOwnershipAction
);

export const getDataEntityGroupCreatingStatuses = createStatusesSelector(
  actions.createDataEntityGroupActionType
);

export const getDataEntityGroupUpdatingStatuses = createStatusesSelector(
  actions.updateDataEntityGroupActionType
);

export const getDataEntityAddToGroupStatuses = createStatusesSelector(
  actions.addDataEntityToGroupActionType
);

export const getDataEntityDeleteFromGroupStatuses = createStatusesSelector(
  actions.deleteDataEntityFromGroupActionType
);

export const getDataEntityAddTermStatuses = createStatusesSelector(
  actions.addDataEntityTermActType
);
