import { createSelector } from 'reselect';
import { DatasetStructureState, RootState } from 'redux/interfaces';
import { createFetchingSelector } from 'redux/selectors/loader-selectors';
import isNumber from 'lodash/isNumber';
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

const getDataSetStructureFetchingStatus = createFetchingSelector(
  'GET_DATA_SET_STRUCTURE'
);

export const getDataSetStructureFetching = createSelector(
  getDataSetStructureFetchingStatus,
  status => status === 'fetching'
);

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

const getDatasetFieldFormDataUpdatingStatus = createFetchingSelector(
  'PUT_DATA_SET_FIELD_FORM_DATA'
);

export const getDatasetFieldFormDataUpdating = createSelector(
  getDatasetFieldFormDataUpdatingStatus,
  status => status === 'fetching'
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

const getDatasetFieldEnumsFetchingStatus = createFetchingSelector(
  'GET_DATA_SET_FIELD_ENUM'
);

const getDatasetFieldEnumsCreatingStatus = createFetchingSelector(
  'POST_DATA_SET_FIELD_ENUM'
);

export const getDatasetFieldEnumsFetching = createSelector(
  getDatasetFieldEnumsFetchingStatus,
  statusFetch => statusFetch === 'fetching'
);

export const getDatasetFieldEnumsCreating = createSelector(
  getDatasetFieldEnumsCreatingStatus,
  statusCreate => statusCreate === 'fetching'
);
