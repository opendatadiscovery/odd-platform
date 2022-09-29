import { createActionType } from 'redux/lib/helpers';

export const metadataActionTypePrefix = 'metadata';

export const createDataEntityMetadataAction = createActionType(
  metadataActionTypePrefix,
  'createDataEntityMetadata'
);

export const updateDataEntityMetadataAction = createActionType(
  metadataActionTypePrefix,
  'updateDataEntityMetadata'
);

export const deleteDataEntityMetadataAction = createActionType(
  metadataActionTypePrefix,
  'deleteDataEntityMetadata'
);

export const searchMetadataAction = createActionType(
  metadataActionTypePrefix,
  'searchMetadata'
);
