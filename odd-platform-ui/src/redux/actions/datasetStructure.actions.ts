import { createActionType } from 'lib/redux/helpers';

export const datasetStructureActionTypePrefix = 'datasetStructure';

export const fetchDataSetStructureActionType = createActionType(
  datasetStructureActionTypePrefix,
  'fetchDataSetStructure'
);

export const fetchDataSetStructureLatestActionType = createActionType(
  datasetStructureActionTypePrefix,
  'fetchDataSetStructureLatest'
);

export const updateDataSetFieldFormDataParamsActionType = createActionType(
  datasetStructureActionTypePrefix,
  'updateDataSetFieldFormDataParams'
);

export const fetchDataSetFieldEnumActionType = createActionType(
  datasetStructureActionTypePrefix,
  'fetchDataSetFieldEnum'
);

export const createDataSetFieldEnumActionType = createActionType(
  datasetStructureActionTypePrefix,
  'createDataSetFieldEnum'
);
