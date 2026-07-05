import React from 'react';
import { Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { SavedSearch } from 'generated-sources';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { deleteSavedSearch, fetchSavedSearchList } from 'redux/thunks';
import { getSavedSearchList, getSavedSearchListFetchingStatuses } from 'redux/selectors';
import { searchFormDataToUrlState, searchStateToParams } from 'lib/search/searchUrlState';
import { searchPath } from 'routes';
import { AppPopover, AppTooltip, Button, CopyButton } from 'components/shared/elements';
import { AddIcon, DeleteIcon, EditIcon, SearchIcon } from 'components/shared/icons';
import SavedSearchForm from './SavedSearchForm';

const PAGE_SIZE = 100;

/**
 * ST-3 / #1837 (ADR D11) — the saved-search toolbar for the data-entity search. Sits alongside SearchSortMenu
 * under the `!routerSearchId` guard (there is no shareable spec on the legacy `/search/{sessionId}` route).
 * "Save current search" captures the live URL spec (via SavedSearchForm); the "Saved searches" popover lists
 * the user's saved searches with REAPPLY (navigate to the rebuilt param URL — the Search page re-queries
 * itself, D10), rename, delete and a copy-share-link affordance.
 *
 * Defensive by construction: `searchFormDataToUrlState` tolerates a malformed / empty stored spec and never
 * throws, so a bad row can never white-screen the app (no error boundary — IT-006).
 */
const SavedSearches: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const savedSearches = useAppSelector(getSavedSearchList);
  const { isLoading: isListLoading } = useAppSelector(getSavedSearchListFetchingStatuses);

  const loadList = React.useCallback(() => {
    dispatch(fetchSavedSearchList({ page: 1, size: PAGE_SIZE }));
  }, [dispatch]);

  // REAPPLY: rebuild the canonical param URL from the stored spec and navigate — the Search page re-queries
  // off the new URL (D10). Navigating to the same route with new params re-runs the reader effect there.
  const handleReapply = React.useCallback(
    (item: SavedSearch) => () => {
      const params = searchStateToParams(searchFormDataToUrlState(item.spec));
      navigate(`${searchPath()}${params ? `?${params}` : ''}`);
    },
    [navigate]
  );

  const handleDelete = React.useCallback(
    (item: SavedSearch) => () => {
      dispatch(deleteSavedSearch({ savedSearchId: item.id }));
    },
    [dispatch]
  );

  const shareLink = React.useCallback((item: SavedSearch) => {
    const params = searchStateToParams(searchFormDataToUrlState(item.spec));
    return `${window.location.origin}${searchPath()}${params ? `?${params}` : ''}`;
  }, []);

  return (
    <Grid
      container
      wrap='nowrap'
      alignItems='center'
      sx={{ mt: 2, width: 'auto', columnGap: 1 }}
    >
      <SavedSearchForm
        btnEl={
          <Button
            buttonType='secondary-m'
            text={t('Save current search')}
            startIcon={<AddIcon />}
          />
        }
      />
      <AppPopover
        isLoading={isListLoading && savedSearches.length === 0}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: -8, horizontal: 'left' }}
        childrenSx={{ p: 0 }}
        renderOpenBtn={({ onClick, ariaDescribedBy }) => (
          <Button
            aria-describedby={ariaDescribedBy}
            buttonType='tertiary-m'
            text={t('Saved searches')}
            startIcon={<SearchIcon />}
            onClick={event => {
              loadList();
              onClick(event);
            }}
          />
        )}
      >
        <Grid
          container
          flexDirection='column'
          wrap='nowrap'
          sx={{ width: 320, maxHeight: 400, overflowY: 'auto', py: 0.5 }}
        >
          {savedSearches.length === 0 ? (
            <Typography variant='subtitle2' sx={{ px: 1.5, py: 1 }}>
              {t('No saved searches yet')}
            </Typography>
          ) : (
            savedSearches.map(item => (
              <Grid
                key={item.id}
                container
                item
                wrap='nowrap'
                alignItems='center'
                sx={{
                  px: 1.5,
                  py: 0.75,
                  columnGap: 0.5,
                  '&:hover': { backgroundColor: 'backgrounds.primary' },
                }}
              >
                <AppTooltip title={item.name}>
                  <Typography
                    variant='body1'
                    onClick={handleReapply(item)}
                    sx={{
                      flexGrow: 1,
                      minWidth: 0,
                      cursor: 'pointer',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.name}
                  </Typography>
                </AppTooltip>
                <SavedSearchForm
                  savedSearch={item}
                  btnEl={
                    <Button
                      buttonType='linkGray-m'
                      icon={<EditIcon />}
                      aria-label={t('Rename')}
                    />
                  }
                />
                <AppTooltip title={t('Copy link')}>
                  <CopyButton buttonType='linkGray-m' stringToCopy={shareLink(item)} />
                </AppTooltip>
                <AppTooltip title={t('Delete')}>
                  <Button
                    buttonType='linkGray-m'
                    icon={<DeleteIcon />}
                    aria-label={t('Delete')}
                    onClick={handleDelete(item)}
                  />
                </AppTooltip>
              </Grid>
            ))
          )}
        </Grid>
      </AppPopover>
    </Grid>
  );
};

export default SavedSearches;
