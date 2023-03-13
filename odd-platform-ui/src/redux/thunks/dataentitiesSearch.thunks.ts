import type {
  DataEntityRef,
  DataEntitySearchHighlight,
  MultipleFacetType,
  SearchApiGetFiltersForFacetRequest,
  SearchApiGetSearchFacetListRequest,
  SearchApiGetSearchResultsRequest,
  SearchApiGetSearchSuggestionsRequest,
  SearchApiHighlightDataEntityRequest,
  SearchApiSearchRequest,
  SearchApiUpdateSearchFacetsRequest,
  SearchFacetsData,
} from 'generated-sources';
import * as actions from 'redux/actions';
import type {
  CurrentPageInfo,
  DataEntity,
  FacetOptions,
  RelatedToEntityId,
} from 'redux/interfaces';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';
import { castDatesToTimestamp } from 'redux/lib/helpers';
import { searchApi } from 'lib/api';

export const createDataEntitiesSearch = handleResponseAsyncThunk<
  SearchFacetsData,
  SearchApiSearchRequest
>(
  actions.createDataEntitySearchActionType,
  async params => await searchApi.search(params),
  {}
);

export const updateDataEntitiesSearch = handleResponseAsyncThunk<
  SearchFacetsData,
  SearchApiUpdateSearchFacetsRequest
>(
  actions.updateDataEntitySearchActionType,
  async params => await searchApi.updateSearchFacets(params),
  {}
);

export const getDataEntitiesSearch = handleResponseAsyncThunk<
  SearchFacetsData,
  SearchApiGetSearchFacetListRequest
>(
  actions.getDataEntitySearchActionType,
  async params => await searchApi.getSearchFacetList(params),
  {}
);

export const fetchDataEntitySearchResults = handleResponseAsyncThunk<
  { items: DataEntity[]; pageInfo: CurrentPageInfo },
  SearchApiGetSearchResultsRequest
>(
  actions.fetchDataEntitySearchResultsActionType,
  async params => {
    const { items, pageInfo } = await searchApi.getSearchResults(params);
    const { page, size } = params;

    return {
      items: castDatesToTimestamp(items),
      pageInfo: { ...pageInfo, page, hasNext: page * size < pageInfo.total },
    };
  },
  {}
);

export const getDataEntitySearchFacetOptions = handleResponseAsyncThunk<
  FacetOptions,
  SearchApiGetFiltersForFacetRequest
>(
  actions.getDataEntitySearchFacetOptionsActionType,
  async params => {
    const countableSearchFilters = await searchApi.getFiltersForFacet(params);
    const { query, page, facetType } = params;

    return {
      facetName: query ? undefined : (facetType.toLowerCase() as MultipleFacetType),
      facetOptions: countableSearchFilters,
      page,
    };
  },
  {}
);

export const fetchSearchSuggestions = handleResponseAsyncThunk<
  DataEntityRef[],
  SearchApiGetSearchSuggestionsRequest
>(
  actions.fetchDataEntitySearchSuggestionsActionType,
  async params => await searchApi.getSearchSuggestions(params),
  {}
);

export const fetchDataEntitySearchHighlights = handleResponseAsyncThunk<
  RelatedToEntityId<{ highlights: DataEntitySearchHighlight }>,
  SearchApiHighlightDataEntityRequest
>(
  actions.fetchDataEntitySearchHighlightsActionType,
  async params => {
    const { dataEntityId } = params;
    const highlights = await searchApi.highlightDataEntity(params);

    return { highlights, entityId: dataEntityId };
  },
  {}
);
