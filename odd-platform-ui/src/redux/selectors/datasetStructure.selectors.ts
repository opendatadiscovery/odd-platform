import { createSelector } from '@reduxjs/toolkit';
import { DatasetStructureState, RootState } from 'redux/interfaces';
import isNumber from 'lodash/isNumber';
import { createStatusesSelector } from 'redux/selectors/loader-selectors';
import * as actions from 'redux/actions';
import { EnumValue } from 'generated-sources';

const getDatasetStructureState = ({
  datasetStructure,
}: RootState): DatasetStructureState => datasetStructure;

export const getDatasetVersionId = (
  { datasetStructure }: RootState,
  {
    datasetId,
    versionId,
  }: { datasetId?: string | number; versionId?: string | number }
) => {
  if (versionId) {
    const versionIdNum = isNumber(versionId)
      ? versionId
      : parseInt(versionId, 10);
    return datasetStructure.allFieldIdsByVersion[versionIdNum]
      ? versionIdNum
      : undefined;
  }
  return datasetId
    ? datasetStructure.latestVersionByDataset[datasetId]
    : undefined;
};

export const datasetParentFieldId = (
  _: RootState,
  { parentField }: { parentField?: number }
) => parentField;

export const getDataSetStructureFetchingStatus = createStatusesSelector(
  actions.fetchDataSetStructureActionType
);
export const getDataSetStructureLatestFetchingStatus =
  createStatusesSelector(actions.fetchDataSetStructureLatestActionType);
export const getDatasetStructure = createSelector(
  getDatasetStructureState,
  getDatasetVersionId,
  datasetParentFieldId,
  (datasetStructureState, versionId, parentFieldId) => {
    if (!versionId) return [];
    return (
      datasetStructureState.allFieldIdsByVersion[versionId][
        parentFieldId || 0
      ]?.map(fieldId => datasetStructureState.fieldById[fieldId]) || []
    );
  }
);

export const getDatasetStructureTypeStats = createSelector(
  getDatasetStructureState,
  getDatasetVersionId,
  (datasetStructureState, versionId) => {
    if (!versionId) return {};
    return datasetStructureState.statsByVersionId[versionId];
  }
);

export const datasetFieldId = (_: RootState, fieldId: number) => fieldId;

export const getDatasetFieldFormDataUpdatingStatus =
  createStatusesSelector(
    actions.updateDataSetFieldFormDataParamsActionType
  );

export const getDatasetFieldData = createSelector(
  getDatasetStructureState,
  datasetFieldId,
  (datasetStructureState, fieldId) => {
    if (!fieldId) return { internalDescription: '', labels: [] };
    return {
      internalDescription:
        datasetStructureState.fieldById[fieldId]?.internalDescription ||
        '',
      labels: datasetStructureState.fieldById[fieldId]?.labels || [],
    };
  }
);

export const getDatasetFieldEnums = createSelector(
  getDatasetStructureState,
  datasetFieldId,
  (datasetStructureState, fieldId) => {
    if (!fieldId) return [{ name: '', description: '' } as EnumValue];
    return datasetStructureState.fieldEnumsByFieldId[fieldId] || [];
  }
);

export const getDatasetFieldEnumsFetchingStatus = createStatusesSelector(
  actions.fetchDataSetFieldEnumActionType
);

export const getDatasetFieldEnumsCreatingStatus = createStatusesSelector(
  actions.createDataSetFieldEnumActionType
);
