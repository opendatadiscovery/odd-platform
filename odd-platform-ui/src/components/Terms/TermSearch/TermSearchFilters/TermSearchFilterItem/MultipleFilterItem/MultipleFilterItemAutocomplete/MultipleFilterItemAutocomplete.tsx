import React, {
  type ChangeEvent,
  type FC,
  type HTMLAttributes,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Autocomplete, type AutocompleteRenderOptionState, Grid } from '@mui/material';
import {
  type AutocompleteInputChangeReason,
  type FilterOptionsState,
  createFilterOptions,
} from '@mui/material/useAutocomplete';
import { useDebouncedCallback } from 'use-debounce';
import { useTranslation } from 'react-i18next';
import type {
  CountableSearchFilter,
  MultipleFacetType,
  SearchFilter,
} from 'generated-sources';
import { Input } from 'components/shared/elements';
import { ClearIcon, DropdownIcon } from 'components/shared/icons';
import type { TermSearchOptionalFacetNames } from 'redux/interfaces';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { getTermSearchFacetsByType, getTermSearchId } from 'redux/selectors';
import { changeTermSearchFacet } from 'redux/slices/termSearch.slice';
import { getTermsSearchFacetOptions } from 'redux/thunks';
import * as S from './MultipleFilterItemAutocompleteStyles';

interface Props {
  name: string;
  facetName: TermSearchOptionalFacetNames;
}

const MultipleFilterItemAutocomplete: FC<Props> = ({ name, facetName }) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const searchId = useAppSelector(getTermSearchId);
  const facetOptionsAll = useAppSelector(getTermSearchFacetsByType(facetName));

  type FilterOption = Omit<SearchFilter, 'id' | 'count' | 'selected'> &
    Partial<CountableSearchFilter>;

  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [facetOptions, setFacetOptions] = useState<FilterOption[]>(facetOptionsAll || []);
  const filter = createFilterOptions<FilterOption>();

  const handleAutocompleteSelect = (
    _: ChangeEvent<unknown>,
    option: FilterOption | null
  ) => {
    if (!option) return;
    setSearchText(''); // Clear input on select
    dispatch(
      changeTermSearchFacet({
        facetName,
        facetOptionId: option.id,
        facetOptionName: option.name,
        facetOptionState: true,
      })
    );
  };

  const searchInputChange = useCallback(
    (_: ChangeEvent<unknown>, query: string, reason: AutocompleteInputChangeReason) => {
      if (reason === 'input') {
        setSearchText(query);
      } else {
        setSearchText(''); // Clear input on select
      }
    },
    [setSearchText]
  );

  const getOptionLabel = useCallback((option: FilterOption) => option.name || '', []);

  const getFilterOptions = useCallback(
    (_: any, params: FilterOptionsState<FilterOption>) =>
      filter(
        searchText
          ? facetOptions.filter(
              option =>
                option.name.toLocaleLowerCase().indexOf(searchText.toLocaleLowerCase()) >=
                0
            )
          : facetOptions,
        params
      ),
    [searchText, facetOptions]
  );

  const [facetOptionsLoading, setFacetOptionsLoading] = useState(false);

  const handleFacetSearch = useCallback(
    useDebouncedCallback(() => {
      setFacetOptionsLoading(true);
      dispatch(
        getTermsSearchFacetOptions({
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
        });
    }, 500),
    [getTermsSearchFacetOptions, setFacetOptionsLoading, setFacetOptions, searchText]
  );

  useEffect(() => {
    if (!autocompleteOpen) return;
    setFacetOptionsLoading(true);
    handleFacetSearch();
  }, [searchText, autocompleteOpen]);

  const fillOptionMatches = (
    props: HTMLAttributes<HTMLLIElement>,
    option: FilterOption,
    state: AutocompleteRenderOptionState
  ) => {
    if (!state.inputValue) {
      return (
        <li {...props}>
          <Grid container justifyContent='space-between'>
            <span>{option.name}</span>
            <S.FilterCount>{option.count}</S.FilterCount>
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
              // eslint-disable-next-line react/no-array-index-key
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
        <Grid container justifyContent='space-between'>
          {highlightedText(option.name, state.inputValue)}
          <S.FilterCount>{option.count}</S.FilterCount>
        </Grid>
      </li>
    );
  };

  return (
    <Autocomplete
      fullWidth
      id={`term-search-filter-${facetName}`}
      open={autocompleteOpen}
      onOpen={() => setAutocompleteOpen(true)}
      onClose={() => setAutocompleteOpen(false)}
      onChange={handleAutocompleteSelect}
      options={facetOptions}
      onInputChange={searchInputChange}
      getOptionLabel={getOptionLabel}
      filterOptions={getFilterOptions}
      handleHomeEndKeys
      selectOnFocus
      blurOnSelect
      value={{ name: searchText }}
      noOptionsText={facetOptionsLoading ? '' : 'No options'}
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
        />
      )}
    />
  );
};

export default MultipleFilterItemAutocomplete;
