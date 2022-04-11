import React, { HTMLAttributes } from 'react';
import {
  Autocomplete,
  AutocompleteRenderOptionState,
  Grid,
} from '@mui/material';
import {
  AutocompleteInputChangeReason,
  createFilterOptions,
} from '@mui/material/useAutocomplete';
import { useDebouncedCallback } from 'use-debounce';
import {
  CountableSearchFilter,
  MultipleFacetType,
  SearchApiGetFiltersForFacetRequest,
  SearchFilter,
} from 'generated-sources';
import AppTextField from 'components/shared/AppTextField/AppTextField';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import { FacetStateUpdate, OptionalFacetNames } from 'redux/interfaces';
import DropdownIcon from 'components/shared/Icons/DropdownIcon';
import { FilterCount } from './MultipleFilterItemAutocompleteStyles';

interface MultipleFilterItemAutocompleteProps {
  searchId: string;
  name: string;
  facetName: OptionalFacetNames;
  facetOptionsAll: CountableSearchFilter[];
  setFacets: (option: FacetStateUpdate) => void;
  searchFacetOptions: (
    params: SearchApiGetFiltersForFacetRequest
  ) => Promise<CountableSearchFilter[]>;
}

const MultipleFilterItemAutocomplete: React.FC<
  MultipleFilterItemAutocompleteProps
> = ({
  searchId,
  name,
  facetName,
  facetOptionsAll,
  setFacets,
  searchFacetOptions,
}) => {
  type FilterOption = Omit<SearchFilter, 'id' | 'count' | 'selected'> &
    Partial<CountableSearchFilter>;

  const [autocompleteOpen, setAutocompleteOpen] = React.useState(false);
  const [searchText, setSearchText] = React.useState<string>('');
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
    setFacets({
      facetName,
      facetOptionId: option.id,
      facetOptionName: option.name,
      facetOptionState: true,
    });
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
    (_, params) =>
      filter(
        searchText
          ? facetOptions.filter(
              option =>
                option.name
                  .toLocaleLowerCase()
                  .indexOf(searchText.toLocaleLowerCase()) >= 0
            )
          : facetOptions,
        params
      ),
    [searchText, facetOptions]
  );

  const [facetOptionsLoading, setFacetOptionsLoading] =
    React.useState<boolean>(false);

  const handleFacetSearch = React.useCallback(
    useDebouncedCallback(() => {
      setFacetOptionsLoading(true);
      searchFacetOptions({
        searchId,
        facetType: facetName.toUpperCase() as MultipleFacetType,
        page: 1,
        size: 30,
        query: searchText,
      }).then(response => {
        setFacetOptionsLoading(false);
        setFacetOptions(response);
      });
    }, 500),
    [
      searchFacetOptions,
      setFacetOptionsLoading,
      setFacetOptions,
      searchText,
    ]
  );

  React.useEffect(() => {
    if (!autocompleteOpen) return;
    setFacetOptionsLoading(true);
    handleFacetSearch();
  }, [searchText, autocompleteOpen]);

  const fillOptionMatches = (
    props: HTMLAttributes<HTMLLIElement>,
    option: FilterOption,
    state: AutocompleteRenderOptionState
  ) => {
    const formattedOptionName =
      facetName === 'types'
        ? option.name.replaceAll('_', ' ')
        : option.name;
    if (!state.inputValue) {
      return (
        <li {...props}>
          <Grid container justifyContent="space-between">
            <span>{formattedOptionName}</span>
            <FilterCount>{option.count}</FilterCount>
          </Grid>
        </li>
      );
    }

    const highlightedText = (text: string, highlight: string) => {
      const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
      return (
        <span>
          {parts.map((part, i) => (
            <span
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              style={
                part.toLowerCase() === highlight.toLowerCase()
                  ? { backgroundColor: '#FFEECC' }
                  : {}
              }
            >
              {part}
            </span>
          ))}
        </span>
      );
    };

    return (
      <li {...props}>
        <Grid container justifyContent="space-between">
          {highlightedText(formattedOptionName, state.inputValue)}
          <FilterCount>{option.count}</FilterCount>
        </Grid>
      </li>
    );
  };

  return (
    <Autocomplete
      fullWidth
      id={`filter-${facetName}`}
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
        <AppTextField
          {...params}
          sx={{ mt: 2 }}
          placeholder="Search by name"
          label={name}
          ref={params.InputProps.ref}
          customEndAdornment={{
            variant: 'loader',
            showAdornment: autocompleteOpen && facetOptionsLoading,
            position: { mr: -2 },
          }}
        />
      )}
    />
  );
};

export default MultipleFilterItemAutocomplete;
