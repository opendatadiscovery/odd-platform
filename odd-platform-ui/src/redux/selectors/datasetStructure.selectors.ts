import { createSelector } from 'reselect';
import { RootState, DatasetStructureState } from 'redux/interfaces';
import { createFetchingSelector } from 'redux/selectors/loader-selectors';
import { isNumber } from 'lodash';

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

const getDatasetFieldLabelsUpdatingStatus = createFetchingSelector(
  'PUT_DATA_SET_FIELD_LABELS'
);

export const getDatasetFieldLabelsUpdating = createSelector(
  getDatasetFieldLabelsUpdatingStatus,
  status => status === 'fetching'
);

export const datasetFieldId = (_: RootState, fieldId: number) => fieldId;

export const getDatasetFieldLabels = createSelector(
  getDatasetStructureState,
  datasetFieldId,
  (datasetStructureState, fieldId) => {
    if (!fieldId) return [];
    return datasetStructureState.fieldById[fieldId]?.labels || [];
  }
);

const getDatasetFieldDescriptionUpdatingStatus = createFetchingSelector(
  'PUT_DATA_SET_FIELD_INTERNAL_DESCRIPTION'
);

export const getDatasetFieldDescriptionUpdating = createSelector(
  getDatasetFieldDescriptionUpdatingStatus,
  status => status === 'fetching'
);

export const getDatasetFieldInternalDescription = createSelector(
  getDatasetStructureState,
  datasetFieldId,
  (datasetStructureState, fieldId) => {
    if (!fieldId) return '';
    return (
      datasetStructureState.fieldById[fieldId]?.internalDescription || ''
    );
  }
);
