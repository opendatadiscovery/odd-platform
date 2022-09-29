import { createActionType } from 'redux/lib/helpers';

export const termsActTypePrefix = 'terms';

export const fetchTermDetailsActType = createActionType(
  termsActTypePrefix,
  'fetchTermDetails'
);
export const createTermActType = createActionType(termsActTypePrefix, 'createTerm');
export const updateTermActType = createActionType(termsActTypePrefix, 'updateTerm');
export const deleteTermActType = createActionType(termsActTypePrefix, 'deleteTerm');
export const fetchTermListActType = createActionType(
  termsActTypePrefix,
  'fetchTermsList'
);
export const updateTermDetailsTagsActType = createActionType(
  termsActTypePrefix,
  'updateTermDetailsTags'
);

// dataEntity terms
export const addDataEntityTermActType = createActionType(
  termsActTypePrefix,
  'addDataEntityTerm'
);
export const deleteDataEntityTermActType = createActionType(
  termsActTypePrefix,
  'deleteDataEntityTerm'
);
