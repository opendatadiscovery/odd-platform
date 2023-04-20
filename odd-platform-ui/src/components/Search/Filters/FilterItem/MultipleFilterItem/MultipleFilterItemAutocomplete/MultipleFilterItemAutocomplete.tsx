import React, { type HTMLAttributes } from 'react';
import { Autocomplete, type AutocompleteRenderOptionState, Grid } from '@mui/material';
import {
  type AutocompleteInputChangeReason,
  type FilterOptionsState,
  createFilterOptions,
} from '@mui/material/useAutocomplete';
import { useDebouncedCallback } from 'use-debounce';
import type {
  CountableSearchFilter,
  MultipleFacetType,
  SearchFilter,
} from 'generated-sources';
import { AppInput } from 'components/shared/elements';
import { ClearIcon, DropdownIcon } from 'components/shared/icons';
import { type OptionalFacetNames } from 'redux/interfaces';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { getDataEntitySearchFacetOptions } from 'redux/thunks';
import { changeDataEntitySearchFacet } from 'redux/slices/dataEntitySearch.slice';
import { getSearchFacetsByType, getSearchId } from 'redux/selectors';
import * as S from './MultipleFilterItemAutocompleteStyles';

interface MultipleFilterItemAutocompleteProps {
  name: string;
  facetName: OptionalFacetNames;
}

const MultipleFilterItemAutocomplete: React.FC<MultipleFilterItemAutocompleteProps> = ({
  name,
  facetName,
}) => {
  const dispatch = useAppDispatch();

  const searchId = useAppSelector(getSearchId);
  const facetOptionsAll = useAppSelector(getSearchFacetsByType(facetName));

  type FilterOption = Omit<SearchFilter, 'id' | 'count' | 'selected'> &
    Partial<CountableSearchFilter>;

  const [autocompleteOpen, setAutocompleteOpen] = React.useState(false);
  const [facetOptionsLoading, setFacetOptionsLoading] = React.useState(false);
  const [searchText, setSearchText] = React.useState('');
  const [facetOptions, setFacetOptions] = React.useState<FilterOption[]>(
    facetOptionsAll || []
  );
  const filter = createFilterOptions<FilterOption>();

  const handleAutocompleteSelect = (
    _: React.ChangeEvent<unknown>,
    option: FilterOption | null
  ) => {
    if (!option) return;
    setSearchText(''); // Clear input on select
    dispatch(
      changeDataEntitySearchFacet({
        facetName,
        facetOptionId: option.id,
        facetOptionName: option.name,
        facetOptionState: true,
      })
    );
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

  const handleFacetSearch = React.useCallback(
    useDebouncedCallback(() => {
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

  const fillOptionMatches = (
    props: HTMLAttributes<HTMLLIElement>,
    option: FilterOption,
    state: AutocompleteRenderOptionState
  ) => {
    const formattedOptionName =
      facetName === 'types' ? option.name.replaceAll('_', ' ') : option.name;
    if (!state.inputValue) {
      return (
        <li {...props}>
          <Grid container justifyContent='space-between' flexWrap='nowrap'>
            <span>{formattedOptionName}</span>
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
        <Grid container justifyContent='space-between' flexWrap='nowrap'>
          {highlightedText(formattedOptionName, state.inputValue)}
          <S.FilterCount>{option.count}</S.FilterCount>
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
      options={facetOptions}
      onInputChange={searchInputChange}
      getOptionLabel={getOptionLabel}
      filterOptions={getFilterOptions}
      handleHomeEndKeys
      selectOnFocus
      componentsProps={{ popper: { sx: S.popperStyles, placement: 'bottom-start' } }}
      blurOnSelect
      value={{ name: searchText }}
      noOptionsText={facetOptionsLoading ? '' : 'No options'}
      renderOption={fillOptionMatches}
      popupIcon={<DropdownIcon />}
      clearIcon={<ClearIcon />}
      renderInput={params => (
        <AppInput
          {...params}
          sx={{ mt: 2 }}
          placeholder='Search by name'
          label={name}
          ref={params.InputProps.ref}
          customEndAdornment={{
            variant: 'loader',
            showAdornment: facetOptionsLoading,
            position: { mr: -2 },
          }}
        />
      )}
    />
  );
};

export default MultipleFilterItemAutocomplete;
