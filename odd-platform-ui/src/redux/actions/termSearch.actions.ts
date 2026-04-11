import { createActionType } from 'redux/lib/helpers';

export const termsSearchActTypePrefix = 'termsSearch';

export const getTermsSearchActType = createActionType(
  termsSearchActTypePrefix,
  'getTermsSearch'
);

export const createTermsSearchActType = createActionType(
  termsSearchActTypePrefix,
  'createTermsSearch'
);

export const updateTermsSearchActType = createActionType(
  termsSearchActTypePrefix,
  'updateTermsSearch'
);

export const fetchTermsSearchResultsActType = createActionType(
  termsSearchActTypePrefix,
  'fetchTermsSearchResults'
);

export const getTermsSearchFacetOptionsActType = createActionType(
  termsSearchActTypePrefix,
  'getTermsSearchFacetOptions'
);

export const fetchTermsSearchSuggestionsActType = createActionType(
  termsSearchActTypePrefix,
  'fetchTermsSearchSuggestions'
);
