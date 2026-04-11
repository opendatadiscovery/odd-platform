import { createActionType } from 'redux/lib/helpers';

export const collectorsActionTypePrefix = 'collectors';

export const fetchCollectorsActionType = createActionType(
  collectorsActionTypePrefix,
  'fetchCollectors'
);

export const updateCollectorActionType = createActionType(
  collectorsActionTypePrefix,
  'updateCollector'
);

export const regenerateCollectorTokenActionType = createActionType(
  collectorsActionTypePrefix,
  'regenerateCollectorToken'
);

export const registerCollectorActionType = createActionType(
  collectorsActionTypePrefix,
  'registerCollector'
);

export const deleteCollectorActionType = createActionType(
  collectorsActionTypePrefix,
  'deleteCollector'
);
