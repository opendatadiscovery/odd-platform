import { createActionType } from 'redux/lib/helpers';

export const datasetStructureActionTypePrefix = 'datasetStructure';

export const fetchDataSetStructureActionType = createActionType(
  datasetStructureActionTypePrefix,
  'fetchDataSetStructure'
);

export const fetchDataSetStructureLatestActionType = createActionType(
  datasetStructureActionTypePrefix,
  'fetchDataSetStructureLatest'
);

export const updateDataSetFieldDescriptionActionType = createActionType(
  datasetStructureActionTypePrefix,
  'updateDataSetFieldDescription'
);

export const updateDataSetFieldLabelsActionType = createActionType(
  datasetStructureActionTypePrefix,
  'updateDataSetFieldLabels'
);

export const fetchDataSetFieldEnumActionType = createActionType(
  datasetStructureActionTypePrefix,
  'fetchDataSetFieldEnum'
);

export const createDataSetFieldEnumActionType = createActionType(
  datasetStructureActionTypePrefix,
  'createDataSetFieldEnum'
);
