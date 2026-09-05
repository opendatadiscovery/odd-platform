import type {
  SavedSearch,
  SavedSearchApiCreateSavedSearchRequest,
  SavedSearchApiDeleteSavedSearchRequest,
  SavedSearchApiGetSavedSearchListRequest,
  SavedSearchApiUpdateSavedSearchRequest,
} from 'generated-sources';
import type { CurrentPageInfo } from 'redux/interfaces';
import i18n from 'locales/i18n';
import * as actions from 'redux/actions';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';
import { savedSearchApi } from 'lib/api';

// ST-3 / ADR D11 — the per-user saved-search CRUD data layer, mirroring the Favorites thunks. Each row's
// `spec` is an AssetSearchFormData (the same object the unified search request sends and the URL encodes —
// #1878); REAPPLY / share are pure URL navigation (assetSearchFormDataToUrlState), so there is no server-side
// "run" call here. Success toasts are localised via
// the i18n singleton (`i18n.t`) because a thunk has no React `t()` hook in scope.

export const fetchSavedSearchList = handleResponseAsyncThunk<
  { items: SavedSearch[]; pageInfo: CurrentPageInfo },
  SavedSearchApiGetSavedSearchListRequest
>(
  actions.fetchSavedSearchListActType,
  async ({ page, size }) => {
    const { items, pageInfo } = await savedSearchApi.getSavedSearchList({ page, size });
    return { items: items ?? [], pageInfo: { ...pageInfo, page } };
  },
  {}
);

export const createSavedSearch = handleResponseAsyncThunk<
  SavedSearch,
  SavedSearchApiCreateSavedSearchRequest
>(
  actions.createSavedSearchActType,
  async ({ savedSearchFormData }) =>
    await savedSearchApi.createSavedSearch({ savedSearchFormData }),
  {
    setSuccessOptions: ({ savedSearchFormData }) => ({
      id: `saved-search-created-${savedSearchFormData.name}`,
      message: i18n.t('Search saved'),
    }),
  }
);

export const updateSavedSearch = handleResponseAsyncThunk<
  SavedSearch,
  SavedSearchApiUpdateSavedSearchRequest
>(
  actions.updateSavedSearchActType,
  async ({ savedSearchId, savedSearchFormData }) =>
    await savedSearchApi.updateSavedSearch({ savedSearchId, savedSearchFormData }),
  {
    setSuccessOptions: ({ savedSearchId }) => ({
      id: `saved-search-updated-${savedSearchId}`,
      message: i18n.t('Saved search updated'),
    }),
  }
);

export const deleteSavedSearch = handleResponseAsyncThunk<
  number,
  SavedSearchApiDeleteSavedSearchRequest
>(
  actions.deleteSavedSearchActType,
  async ({ savedSearchId }) => {
    await savedSearchApi.deleteSavedSearch({ savedSearchId });
    return savedSearchId;
  },
  {
    setSuccessOptions: ({ savedSearchId }) => ({
      id: `saved-search-deleted-${savedSearchId}`,
      message: i18n.t('Saved search deleted'),
    }),
  }
);
