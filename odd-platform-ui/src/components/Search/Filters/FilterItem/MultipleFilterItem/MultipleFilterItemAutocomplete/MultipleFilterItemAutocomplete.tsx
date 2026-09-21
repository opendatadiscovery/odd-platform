import React, { type HTMLAttributes } from 'react';
import { Autocomplete, type AutocompleteRenderOptionState, Grid } from '@mui/material';
import {
  type AutocompleteInputChangeReason,
  createFilterOptions,
  type FilterOptionsState,
} from '@mui/material/useAutocomplete';
import { useDebouncedCallback } from 'use-debounce';
import { useTranslation } from 'react-i18next';
import type {
  CountableSearchFilter,
  MultipleFacetType,
  SearchFilter,
} from 'generated-sources';
import { Button, Input } from 'components/shared/elements';
import { ClearIcon, DropdownIcon } from 'components/shared/icons';
import formatFacetName from 'components/Search/Filters/formatFacetName';
import { type OptionalFacetNames } from 'redux/interfaces';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { getDataEntitySearchFacetOptions } from 'redux/thunks';
import { changeDataEntitySearchFacet } from 'redux/slices/dataEntitySearch.slice';
import {
  getSearchFacetsByType,
  getSearchId,
  getSelectedSearchFacetOptions,
} from 'redux/selectors';
import * as S from './MultipleFilterItemAutocompleteStyles';

interface MultipleFilterItemAutocompleteProps {
  name: string;
  facetName: OptionalFacetNames;
  /**
   * ST-11 (#1845): a STATIC option list (the Datasource / Namespace directories, fetched once by the rail) instead
   * of the per-facet aggregation the legacy session serves (`/api/search/{id}/facet/{type}` — which has no
   * datasource / namespace endpoint, and whose option counts this list therefore does not carry). A value already
   * selected or excluded is hidden from it, exactly as the aggregation hides selected values.
   */
  options?: ReadonlyArray<SearchFilter>;
}

const MultipleFilterItemAutocomplete: React.FC<MultipleFilterItemAutocompleteProps> = ({
  name,
  facetName,
  options: staticOptions,
}) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const searchId = useAppSelector(getSearchId);
  const facetOptionsAll = useAppSelector(getSearchFacetsByType(facetName));
  const selectedOptions = useAppSelector(getSelectedSearchFacetOptions(facetName));

  type FilterOption = Omit<SearchFilter, 'id' | 'count' | 'selected'> &
    Partial<CountableSearchFilter>;

  const [autocompleteOpen, setAutocompleteOpen] = React.useState(false);
  const [facetOptionsLoading, setFacetOptionsLoading] = React.useState(false);
  const [searchText, setSearchText] = React.useState('');
  const [facetOptions, setFacetOptions] = React.useState<FilterOption[]>(
    facetOptionsAll || []
  );
  const filter = createFilterOptions<FilterOption>();

  // A static list is read live (it may load after the first render) with the active values hidden.
  const visibleOptions = React.useMemo<FilterOption[]>(() => {
    if (!staticOptions) return facetOptions;
    const active = new Set((selectedOptions ?? []).map(option => option.entityId));
    return staticOptions.filter(option => !active.has(option.id));
  }, [staticOptions, facetOptions, selectedOptions]);

  const select = React.useCallback(
    (option: FilterOption, exclude: boolean) => {
      if (option.id === undefined) return;
      setSearchText(''); // Clear input on select
      dispatch(
        changeDataEntitySearchFacet({
          facetName,
          facetOptionId: option.id,
          facetOptionName: option.name,
          facetOptionState: true,
          // ST-11 — the row's Exclude action selects the value as an EXCLUSION ("not <value>")
          facetOptionExclude: exclude,
        })
      );
    },
    [dispatch, facetName]
  );

  const handleAutocompleteSelect = (
    _: React.ChangeEvent<unknown>,
    option: FilterOption | null
  ) => {
    if (!option) return;
    select(option, false);
  };

  const searchInputChange = React.useCallback(
    (
      _: React.ChangeEvent<unknown>,
      query: string,
      reason: AutocompleteInputChangeReason
    ) => {
      if (reason === 'input') {
        setSearchText(query);
      } else {
        setSearchText(''); // Clear input on select
      }
    },
    [setSearchText]
  );

  const getOptionLabel = React.useCallback(
    (option: FilterOption) => option.name || '',
    []
  );

  const getFilterOptions = React.useCallback(
    (_: any, params: FilterOptionsState<FilterOption>) =>
      filter(
        searchText
          ? visibleOptions.filter(
              option =>
                option.name.toLocaleLowerCase().indexOf(searchText.toLocaleLowerCase()) >=
                0
            )
          : visibleOptions,
        params
      ),
    [searchText, visibleOptions]
  );

  const handleFacetSearch = React.useCallback(
    useDebouncedCallback(() => {
      if (staticOptions) {
        // the directory is already in hand — nothing to fetch, just open
        setAutocompleteOpen(true);
        return;
      }
      setFacetOptionsLoading(true);
      dispatch(
        getDataEntitySearchFacetOptions({
          searchId,
          facetType: facetName.toUpperCase() as MultipleFacetType,
          page: 1,
          size: 30,
          query: searchText,
        })
      )
        .unwrap()
        .then(response => {
          setFacetOptionsLoading(false);
          setFacetOptions(response.facetOptions);
          setAutocompleteOpen(true);
        });
    }, 500),
    [getDataEntitySearchFacetOptions, setFacetOptionsLoading, setFacetOptions, searchText]
  );

  // ST-11 (#1845) — the row's EXCLUDE action: a real button at the end of the option row that selects the value as
  // an exclusion; the row's own click stays "include" (stopPropagation + preventDefault keep MUI's option select
  // out of it). It is a POINTER shortcut, hidden from assistive technology on purpose: an `option` may not carry
  // interactive descendants (the listbox is driven through the input by arrow keys, so nothing inside a row is ever
  // keyboard-operable), and a nested label would otherwise turn every row's accessible name into
  // "<value> <count> Exclude: …". The keyboard / screen-reader path to the same state is the chip's Exclude toggle
  // (a focusable button with its own name).
  const excludeAction = (option: FilterOption) => (
    <Button
      buttonType='linkGray-m'
      text={t('Exclude')}
      aria-hidden
      tabIndex={-1}
      data-qa={`filter-${facetName}-option-exclude`}
      onMouseDown={event => event.preventDefault()}
      onClick={event => {
        event.preventDefault();
        event.stopPropagation();
        select(option, true);
        setAutocompleteOpen(false);
      }}
      sx={{ ml: 1, flexShrink: 0 }}
    />
  );

  const fillOptionMatches = (
    props: HTMLAttributes<HTMLLIElement>,
    option: FilterOption,
    state: AutocompleteRenderOptionState
  ) => {
    const formattedOptionName = formatFacetName(facetName, option.name);
    if (!state.inputValue) {
      return (
        <li {...props}>
          <Grid
            container
            justifyContent='space-between'
            flexWrap='nowrap'
            alignItems='center'
          >
            <span>{formattedOptionName}</span>
            <Grid display='inline-flex' alignItems='center' flexWrap='nowrap'>
              {option.count !== undefined && (
                <S.FilterCount>{option.count}</S.FilterCount>
              )}
              {excludeAction(option)}
            </Grid>
          </Grid>
        </li>
      );
    }

    const highlightedText = (text: string, highlight: string) => {
      const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
      return (
        <span>
          {parts.map((part, i) => (
            <S.HighlightedTextPart
              key={i}
              isHighlighted={part.toLowerCase() === highlight.toLowerCase()}
            >
              {part}
            </S.HighlightedTextPart>
          ))}
        </span>
      );
    };

    return (
      <li {...props}>
        <Grid
          container
          justifyContent='space-between'
          flexWrap='nowrap'
          alignItems='center'
        >
          {highlightedText(formattedOptionName, state.inputValue)}
          <Grid display='inline-flex' alignItems='center' flexWrap='nowrap'>
            {option.count !== undefined && <S.FilterCount>{option.count}</S.FilterCount>}
            {excludeAction(option)}
          </Grid>
        </Grid>
      </li>
    );
  };

  const handleOpen = () => handleFacetSearch();
  const handleClose = () => setAutocompleteOpen(false);

  return (
    <Autocomplete
      fullWidth
      id={`filter-${facetName}`}
      open={autocompleteOpen}
      onOpen={handleOpen}
      onClose={handleClose}
      onChange={handleAutocompleteSelect}
      options={visibleOptions}
      onInputChange={searchInputChange}
      getOptionLabel={getOptionLabel}
      filterOptions={getFilterOptions}
      handleHomeEndKeys
      selectOnFocus
      componentsProps={{ popper: { sx: S.popperStyles, placement: 'bottom-start' } }}
      blurOnSelect
      value={{ name: searchText }}
      noOptionsText={facetOptionsLoading ? '' : t('No options')}
      renderOption={fillOptionMatches}
      popupIcon={<DropdownIcon />}
      clearIcon={<ClearIcon />}
      renderInput={params => (
        <Input
          sx={{ mt: 2 }}
          variant='main-m'
          inputContainerRef={params.InputProps.ref}
          inputProps={params.inputProps}
          label={name}
          placeholder={t('Search by name')}
          isLoading={facetOptionsLoading}
        />
      )}
    />
  );
};

export default MultipleFilterItemAutocomplete;
