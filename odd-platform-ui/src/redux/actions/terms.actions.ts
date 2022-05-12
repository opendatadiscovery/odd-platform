import { createAction } from 'redux/lib/helpers';

export const termsActionPrefix = 'terms';

export const fetchTermDetailsAction = createAction(
  termsActionPrefix,
  'fetchTermDetails'
);

export const createTermAction = createAction(
  termsActionPrefix,
  'createTerm'
);

export const updateTermAction = createAction(
  termsActionPrefix,
  'updateTerm'
);

export const deleteTermAction = createAction(
  termsActionPrefix,
  'deleteTerm'
);

export const fetchTermsListAction = createAction(
  termsActionPrefix,
  'fetchTermsList'
);

export const updateTermDetailsTagsAction = createAction(
  termsActionPrefix,
  'updateTermDetailsTags'
);
