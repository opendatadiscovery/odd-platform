import { createActionType } from 'redux/lib/helpers';

export const savedSearchActTypePrefix = 'savedSearch';

export const fetchSavedSearchListActType = createActionType(
  savedSearchActTypePrefix,
  'fetchSavedSearchList'
);
export const createSavedSearchActType = createActionType(
  savedSearchActTypePrefix,
  'createSavedSearch'
);
export const updateSavedSearchActType = createActionType(
  savedSearchActTypePrefix,
  'updateSavedSearch'
);
export const deleteSavedSearchActType = createActionType(
  savedSearchActTypePrefix,
  'deleteSavedSearch'
);
