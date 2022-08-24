import { createActionType } from 'lib/redux/helpers';

export const termsSearchActionTypePrefix = 'termsSearch';

export const getTermsSearchActionType = createActionType(
  termsSearchActionTypePrefix,
  'getTermsSearch'
);

export const createTermsSearchActionType = createActionType(
  termsSearchActionTypePrefix,
  'createTermsSearch'
);

export const updateTermsSearchActionType = createActionType(
  termsSearchActionTypePrefix,
  'updateTermsSearch'
);

export const fetchTermsSearchResultsActionType = createActionType(
  termsSearchActionTypePrefix,
  'fetchTermsSearchResults'
);

export const getTermsSearchFacetOptionsActionType = createActionType(
  termsSearchActionTypePrefix,
  'getTermsSearchFacetOptions'
);

export const fetchTermsSearchSuggestionsActionType = createActionType(
  termsSearchActionTypePrefix,
  'fetchTermsSearchSuggestions'
);
