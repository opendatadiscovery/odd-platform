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
import { Input } from 'components/shared/elements';
import { ClearIcon, DropdownIcon } from 'components/shared/icons';
import formatFacetName from 'components/Search/Filters/formatFacetName';
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
  const { t } = useTranslation();

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

  // The server returns only the first page, so every typed query must reach it; a response to an older query
  // that lands after a newer one is dropped.
  const latestRequestId = React.useRef(0);
  // Typing into a closed popup fires onInputChange then onOpen before `searchText` re-renders; onOpen reads this.
  const latestQuery = React.useRef('');
  const fetchFacetOptions = useDebouncedCallback((query: string) => {
    latestRequestId.current += 1;
    const requestId = latestRequestId.current;
    setFacetOptionsLoading(true);
    dispatch(
      getDataEntitySearchFacetOptions({
        searchId,
        facetType: facetName.toUpperCase() as MultipleFacetType,
        page: 1,
        size: 30,
        query,
      })
    )
      .unwrap()
      .then(response => {
        if (requestId !== latestRequestId.current) return;
        setFacetOptions(response.facetOptions);
        setAutocompleteOpen(true);
      })
      .finally(() => {
        if (requestId === latestRequestId.current) setFacetOptionsLoading(false);
      });
  }, 500);

  const searchInputChange = React.useCallback(
    (
      _: React.ChangeEvent<unknown>,
      query: string,
      reason: AutocompleteInputChangeReason
    ) => {
      if (reason === 'input') {
        latestQuery.current = query;
        setSearchText(query);
        fetchFacetOptions(query);
      } else {
        latestQuery.current = '';
        setSearchText(''); // Clear input on select
      }
    },
    [setSearchText, fetchFacetOptions]
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

  const fillOptionMatches = (
    props: HTMLAttributes<HTMLLIElement>,
    option: FilterOption,
    state: AutocompleteRenderOptionState
  ) => {
    const formattedOptionName = formatFacetName(facetName, option.name);
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

  const handleOpen = () => fetchFacetOptions(latestQuery.current);
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
