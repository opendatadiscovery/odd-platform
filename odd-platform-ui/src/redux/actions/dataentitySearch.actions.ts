import { createActionType } from 'redux/lib/helpers';

export const dataEntitiesSearchActionTypePrefix = 'dataEntitiesSearch';

export const getDataEntitySearchActionType = createActionType(
  dataEntitiesSearchActionTypePrefix,
  'getDataEntitySearch'
);

export const createDataEntitySearchActionType = createActionType(
  dataEntitiesSearchActionTypePrefix,
  'createDataEntitySearch'
);

export const updateDataEntitySearchActionType = createActionType(
  dataEntitiesSearchActionTypePrefix,
  'updateDataEntitySearch'
);

export const fetchDataEntitySearchResultsActionType = createActionType(
  dataEntitiesSearchActionTypePrefix,
  'fetchDataEntitySearchResults'
);

export const getDataEntitySearchFacetOptionsActionType = createActionType(
  dataEntitiesSearchActionTypePrefix,
  'getDataEntitySearchFacetOptions'
);

export const fetchDataEntitySearchSuggestionsActionType = createActionType(
  dataEntitiesSearchActionTypePrefix,
  'fetchDataEntitySearchSuggestions'
);

export const fetchDataEntitySearchHighlightsActionType = createActionType(
  dataEntitiesSearchActionTypePrefix,
  'fetchDataEntitySearchHighlights'
);
