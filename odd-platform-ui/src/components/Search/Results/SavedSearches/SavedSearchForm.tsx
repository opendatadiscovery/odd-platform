import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { SavedSearch } from 'generated-sources';
import { Button, DialogWrapper, Input } from 'components/shared/elements';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { createSavedSearch, updateSavedSearch } from 'redux/thunks';
import {
  getSavedSearchCreatingStatuses,
  getSavedSearchUpdatingStatuses,
} from 'redux/selectors';
import {
  paramsToSearchState,
  searchUrlStateToAssetSearchFormData,
} from 'lib/search/searchUrlState';

interface SavedSearchFormProps {
  // The trigger element — cloned with an onClick that opens the dialog (the DialogWrapper contract).
  btnEl: JSX.Element;
  // Absent → CREATE (capture the current search from the URL); present → RENAME (keep the stored spec).
  savedSearch?: SavedSearch;
}

interface SavedSearchFormValues {
  name: string;
}

/**
 * ST-3 / ADR D11 — one component does create-OR-rename for a saved search, mirroring NamespaceForm
 * (react-hook-form + Controller + Input inside a DialogWrapper). CREATE captures the CURRENT main search —
 * the COMPLETE one: query + facets + the My-data scope + sort + asset kinds + favorites — as the same
 * `AssetSearchFormData` the search request sends, from the canonical param URL (D10 / D11; #1878 closed the gap
 * where the saved spec was the narrower `SearchFormData` and silently dropped the last two). RENAME edits only
 * the name and preserves the item's stored spec — a rename never re-captures the live URL.
 */
const SavedSearchForm: React.FC<SavedSearchFormProps> = ({ btnEl, savedSearch }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const location = useLocation();

  const { isLoading: isCreating, isLoaded: isCreated } = useAppSelector(
    getSavedSearchCreatingStatuses
  );
  const { isLoading: isUpdating, isLoaded: isUpdated } = useAppSelector(
    getSavedSearchUpdatingStatuses
  );

  const { control, handleSubmit, reset, formState } = useForm<SavedSearchFormValues>({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const clearState = () => {
    reset();
  };

  const handleFormSubmit = ({ name }: SavedSearchFormValues) => {
    const trimmedName = name.trim();
    (savedSearch
      ? dispatch(
          updateSavedSearch({
            savedSearchId: savedSearch.id,
            // Rename only — keep the stored spec intact (never re-capture the live URL on rename).
            savedSearchFormData: { name: trimmedName, spec: savedSearch.spec },
          })
        )
      : dispatch(
          createSavedSearch({
            savedSearchFormData: {
              name: trimmedName,
              // Capture the CURRENT main search from the URL — the canonical source of truth (D10).
              // NOT the getSearchUrlState selector: it omits `sort`, which would drop the active ordering.
              // The FULL request projection (#1878): `searchUrlStateToFormData` would drop asset_kinds +
              // favorites exactly the way the old contract did.
              spec: searchUrlStateToAssetSearchFormData(
                paramsToSearchState(location.search)
              ),
            },
          })
        )
    ).then(() => {
      clearState();
    });
  };

  const formTitle = (
    <Typography variant='h4' component='span'>
      {savedSearch ? t('Rename') : t('Save current search')}
    </Typography>
  );

  const formContent = () => (
    <form id='saved-search-form' onSubmit={handleSubmit(handleFormSubmit)}>
      <Controller
        name='name'
        control={control}
        defaultValue={savedSearch?.name ?? ''}
        rules={{ required: true, validate: value => !!value.trim() }}
        render={({ field }) => (
          <Input {...field} variant='main-m' placeholder={t('Enter search name')} />
        )}
      />
    </form>
  );

  const formActionButtons = () => (
    <Button
      text={t('Save')}
      type='submit'
      form='saved-search-form'
      buttonType='main-lg'
      fullWidth
      disabled={!formState.isValid}
    />
  );

  return (
    <DialogWrapper
      maxWidth='xs'
      renderOpenBtn={({ handleOpen }) =>
        React.cloneElement(btnEl, { onClick: handleOpen })
      }
      title={formTitle}
      renderContent={formContent}
      renderActions={formActionButtons}
      handleCloseSubmittedForm={savedSearch ? isUpdated : isCreated}
      isLoading={savedSearch ? isUpdating : isCreating}
      clearState={clearState}
    />
  );
};

export default SavedSearchForm;
