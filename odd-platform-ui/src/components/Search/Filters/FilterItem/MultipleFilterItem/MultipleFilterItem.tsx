import React, { HTMLAttributes } from 'react';
import {
  Autocomplete,
  AutocompleteRenderOptionState,
  CircularProgress,
  Grid,
  TextField,
  Typography,
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
import {
  FacetStateUpdate,
  OptionalFacetNames,
  SearchFilterStateSynced,
} from 'redux/interfaces/search';
import { StylesType } from 'components/Search/Filters/FilterItem/MultipleFilterItem/MultipleFilterItemStyles';
import SelectedFilterOption from 'components/Search/Filters/FilterItem/SelectedFilterOption/SelectedFilterOption';
import DropdownIcon from 'components/shared/Icons/DropdownIcon';

interface FilterItemProps extends StylesType {
  searchId: string;
  name: string;
  facetName: OptionalFacetNames;
  facetOptionsAll: CountableSearchFilter[];
  selectedOptions?: SearchFilterStateSynced[];
  setFacets: (option: FacetStateUpdate) => void;
  searchFacetOptions: (
    params: SearchApiGetFiltersForFacetRequest
  ) => Promise<CountableSearchFilter[]>;
}

const MultipleFilterItem: React.FC<FilterItemProps> = ({
  classes,
  searchId,
  name,
  facetName,
  facetOptionsAll,
  selectedOptions,
  setFacets,
  searchFacetOptions,
}) => {
  type FilterOption = Omit<SearchFilter, 'id' | 'count' | 'selected'> &
    Partial<CountableSearchFilter>;
  const [facetOptions, setFacetOptions] = React.useState<FilterOption[]>(
    facetOptionsAll || []
  );
  const [autocompleteOpen, setAutocompleteOpen] = React.useState(false);
  const [
    facetOptionsLoading,
    setFacetOptionsLoading,
  ] = React.useState<boolean>(false);
  const [searchText, setSearchText] = React.useState<string>('');
  const filter = createFilterOptions<FilterOption>();

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

  const getOptionLabel = React.useCallback(
    (option: FilterOption) => option.name || '',
    []
  );

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

  const fillOptionMatches = (
    props: HTMLAttributes<HTMLLIElement>,
    option: FilterOption,
    state: AutocompleteRenderOptionState
  ) => {
    const formattedOptionName =
      facetName === 'subtypes'
        ? option.name.replaceAll('_', ' ')
        : option.name;
    if (!state.inputValue) {
      return (
        <li {...props}>
          <Grid container justifyContent="space-between">
            <span>{formattedOptionName}</span>
            <span className={classes.filterCount}>{option.count}</span>
          </Grid>
        </li>
      );
    }

    const lowCaseInputValue = state.inputValue.toLowerCase();
    const inputValueLength = state.inputValue.length;
    const inputValSubstrIndex = formattedOptionName
      .toLowerCase()
      .indexOf(lowCaseInputValue);

    const string = formattedOptionName.substr(0, inputValSubstrIndex);
    const highlightedText = formattedOptionName.substr(
      inputValSubstrIndex,
      inputValueLength
    );
    const endString = formattedOptionName.substr(
      inputValSubstrIndex + inputValueLength
    );

    return (
      <Grid container justifyContent="space-between">
        <span>
          {string}
          <span className={classes.highlightedOption}>
            {highlightedText}
          </span>
          {endString}
        </span>
        <span className={classes.filterCount}>{option.count}</span>
      </Grid>
    );
  };

  return (
    <Grid container className={classes.container}>
      <Grid item xs={12}>
        <Typography variant="h5" className={classes.caption}>
          {name}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Autocomplete
          className={classes.autoComplete}
          fullWidth
          popupIcon={<DropdownIcon />}
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
          renderInput={params => (
            <TextField
              {...params}
              placeholder="Search by name"
              variant="outlined"
              fullWidth
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {autocompleteOpen && facetOptionsLoading ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      </Grid>
      <Grid
        item
        xs={12}
        container
        className={classes.selectedOptionsContainer}
        wrap="wrap"
      >
        {selectedOptions?.map(option => (
          <SelectedFilterOption
            key={option.entityId}
            facetName={facetName}
            filter={option}
            className={classes.selectedOption}
          />
        ))}
      </Grid>
    </Grid>
  );
};

export default MultipleFilterItem;
