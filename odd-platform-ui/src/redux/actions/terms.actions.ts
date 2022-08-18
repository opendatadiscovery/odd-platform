import { createActionType } from 'lib/redux/helpers';

export const termsActionTypePrefix = 'terms';

export const fetchTermDetailsAction = createActionType(
  termsActionTypePrefix,
  'fetchTermDetails'
);

export const createTermAction = createActionType(
  termsActionTypePrefix,
  'createTerm'
);

export const updateTermAction = createActionType(
  termsActionTypePrefix,
  'updateTerm'
);

export const deleteTermAction = createActionType(
  termsActionTypePrefix,
  'deleteTerm'
);

export const fetchTermsListAction = createActionType(
  termsActionTypePrefix,
  'fetchTermsList'
);

export const updateTermDetailsTagsAction = createActionType(
  termsActionTypePrefix,
  'updateTermDetailsTags'
);

// dataEntity terms
export const addDataEntityTermAction = createActionType(
  termsActionTypePrefix,
  'addDataEntityTerm'
);

export const deleteDataEntityTermAction = createActionType(
  termsActionTypePrefix,
  'deleteDataEntityTerm'
);
