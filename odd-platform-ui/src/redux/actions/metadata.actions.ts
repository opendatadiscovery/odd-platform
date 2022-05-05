import { createAction } from 'lib/helpers';

export const metadataActionPrefix = 'metadata';

export const createDataEntityMetadataAction = createAction(
  metadataActionPrefix,
  'createDataEntityMetadata'
);

export const updateDataEntityMetadataAction = createAction(
  metadataActionPrefix,
  'updateDataEntityMetadata'
);

export const deleteDataEntityMetadataAction = createAction(
  metadataActionPrefix,
  'deleteDataEntityMetadata'
);

export const searchMetadataAction = createAction(
  metadataActionPrefix,
  'searchMetadata'
);
