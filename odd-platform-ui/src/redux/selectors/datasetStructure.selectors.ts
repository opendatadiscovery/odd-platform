import { createSelector } from '@reduxjs/toolkit';
import type {
  DatasetStructureIds,
  DatasetStructureState,
  RootState,
} from 'redux/interfaces';
import {
  createErrorSelector,
  createStatusesSelector,
} from 'redux/selectors/loader-selectors';
import * as actions from 'redux/actions';
import type { EnumValueList } from 'generated-sources';
import { emptyArr } from 'lib/constants';

export const getDataSetStructureFetchingStatus = createStatusesSelector(
  actions.fetchDataSetStructureActionType
);
export const getDataSetStructureFetchingError = createErrorSelector(
  actions.fetchDataSetStructureActionType
);
export const getDataSetStructureLatestFetchingStatus = createStatusesSelector(
  actions.fetchDataSetStructureLatestActionType
);
export const getDataSetStructureLatestFetchingError = createErrorSelector(
  actions.fetchDataSetStructureLatestActionType
);

export const getDatasetFieldDescriptionUpdatingStatus = createStatusesSelector(
  actions.updateDataSetFieldDescriptionActionType
);

export const getDatasetFieldLabelsUpdatingStatus = createStatusesSelector(
  actions.updateDataSetFieldLabelsActionType
);

export const getDatasetFieldEnumsFetchingError = createErrorSelector(
  actions.fetchDataSetFieldEnumActionType
);

export const getDatasetFieldEnumsCreatingStatus = createStatusesSelector(
  actions.createDataSetFieldEnumActionType
);

const getDatasetStructureState = ({
  datasetStructure,
}: RootState): DatasetStructureState => datasetStructure;

export const getDatasetVersionId = ({ datasetId, versionId }: DatasetStructureIds) =>
  createSelector(getDatasetStructureState, datasetStructureState => {
    if (versionId) {
      return datasetStructureState.allFieldIdsByVersion[versionId]
        ? versionId
        : undefined;
    }
    return datasetId
      ? datasetStructureState.latestVersionByDataset[datasetId]
      : undefined;
  });

export const getDatasetStructure = ({
  datasetId,
  versionId,
  parentFieldId,
}: DatasetStructureIds) =>
  createSelector(
    getDatasetStructureState,
    getDatasetVersionId({ datasetId, versionId }),
    (datasetStructureState, currentVersionId) => {
      if (!currentVersionId) return emptyArr;

      return (
        datasetStructureState.allFieldIdsByVersion[currentVersionId][
          parentFieldId || 0
        ]?.map(fieldId => datasetStructureState.fieldById[fieldId]) || emptyArr
      );
    }
  );

export const getDatasetStructureTypeStats = ({
  datasetId,
  versionId,
}: DatasetStructureIds) =>
  createSelector(
    getDatasetStructureState,
    getDatasetVersionId({ datasetId, versionId }),
    (datasetStructureState, currentVersionId) => {
      if (!currentVersionId) return {};
      return datasetStructureState.statsByVersionId[currentVersionId].typeStats;
    }
  );

export const getDatasetFieldEnums = (datasetFieldId: number) =>
  createSelector(
    getDatasetStructureState,
    (datasetStructureState): EnumValueList =>
      datasetStructureState.fieldEnumsByFieldId[datasetFieldId]
  );

export const getDatasetFieldById = (datasetFieldId: number) =>
  createSelector(
    getDatasetStructureState,
    datasetStructureState => datasetStructureState.fieldById[datasetFieldId]
  );

export const getDatasetFieldName = (datasetFieldId: number | undefined) =>
  createSelector(getDatasetStructureState, datasetStructureState =>
    datasetFieldId ? datasetStructureState.fieldById[datasetFieldId].name : undefined
  );
