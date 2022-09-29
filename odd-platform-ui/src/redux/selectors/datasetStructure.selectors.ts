import { createSelector } from '@reduxjs/toolkit';
import { DatasetStructureIds, DatasetStructureState, RootState } from 'redux/interfaces';
import { createStatusesSelector } from 'redux/selectors/loader-selectors';
import * as actions from 'redux/actions';
import { EnumValue } from 'generated-sources';
import { emptyArr } from 'lib/constants';

export const getDataSetStructureFetchingStatus = createStatusesSelector(
  actions.fetchDataSetStructureActionType
);
export const getDataSetStructureLatestFetchingStatus = createStatusesSelector(
  actions.fetchDataSetStructureLatestActionType
);

export const getDatasetFieldFormDataUpdatingStatus = createStatusesSelector(
  actions.updateDataSetFieldFormDataParamsActionType
);

export const getDatasetFieldEnumsFetchingStatus = createStatusesSelector(
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
      if (!currentVersionId) return [];

      return (
        datasetStructureState.allFieldIdsByVersion[currentVersionId][
          parentFieldId || 0
        ]?.map(fieldId => datasetStructureState.fieldById[fieldId]) || []
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

export const getIsUniqStatsExist = ({ datasetId, versionId }: DatasetStructureIds) =>
  createSelector(
    getDatasetStructureState,
    getDatasetVersionId({ datasetId, versionId }),
    (datasetStructureState, currentVersionId) => {
      if (!currentVersionId) return false;
      return datasetStructureState.statsByVersionId[currentVersionId].isUniqueStatsExist;
    }
  );

export const getDatasetFieldData = (datasetFieldId: number) =>
  createSelector(getDatasetStructureState, datasetStructureState => {
    if (!datasetFieldId) return { internalDescription: '', labels: [] };
    return {
      internalDescription:
        datasetStructureState.fieldById[datasetFieldId]?.internalDescription || '',
      labels: datasetStructureState.fieldById[datasetFieldId]?.labels || [],
    };
  });

export const getDatasetFieldEnums = (datasetFieldId: number) =>
  createSelector(getDatasetStructureState, datasetStructureState => {
    if (!datasetFieldId) return [{ name: '', description: '' } as EnumValue];
    return datasetStructureState.fieldEnumsByFieldId[datasetFieldId] || emptyArr;
  });
