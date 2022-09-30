import React from 'react';
import { Autocomplete, Grid, Typography } from '@mui/material';
import { DataEntityTermFormData, TermRef } from 'generated-sources';
import {
  AutocompleteInputChangeReason,
  createFilterOptions,
} from '@mui/material/useAutocomplete';
import { useDebouncedCallback } from 'use-debounce';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import AppInput from 'components/shared/AppInput/AppInput';

import { ControllerRenderProps } from 'react-hook-form';
import { useAppDispatch } from 'redux/lib/hooks';
import { fetchTermsList } from 'redux/thunks';

interface TermsAutocompleteProps {
  setSelectedTerm: (term: TermRef) => void;
  field: ControllerRenderProps<DataEntityTermFormData, 'termId'>;
}

const TermsAutocomplete: React.FC<TermsAutocompleteProps> = ({
  setSelectedTerm,
  field,
}) => {
  const dispatch = useAppDispatch();
  const searchTerms = fetchTermsList;

  type FilterOption = Omit<TermRef, 'id' | 'definition' | 'namespace'> &
    Partial<TermRef>;
  const [options, setOptions] = React.useState<FilterOption[]>([]);
  const [autocompleteOpen, setAutocompleteOpen] = React.useState(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [searchText, setSearchText] = React.useState<string>('');
  const filter = createFilterOptions<FilterOption>();

  const handleSearch = React.useCallback(
    useDebouncedCallback(() => {
      setLoading(true);
      dispatch(searchTerms({ page: 1, size: 30, query: searchText }))
        .unwrap()
        .then(({ termList }) => {
          setLoading(false);
          setOptions(termList);
        });
    }, 500),
    [searchTerms, setLoading, setOptions, searchText]
  );

  const getOptionLabel = React.useCallback(
    (option: FilterOption | string) => {
      if (typeof option === 'string') {
        return option;
      }
      if ('name' in option && option.name) {
        return option.name;
      }
      return '';
    },
    []
  );

  const getFilterOptions = React.useCallback(
    (filterOptions, params) => {
      const filtered = filter(options, params);
      if (
        searchText !== '' &&
        !loading &&
        !options.find(
          option =>
            option.name.toLocaleLowerCase() ===
            searchText.toLocaleLowerCase()
        )
      ) {
        return [...options, { name: searchText }];
      }
      return filtered;
    },
    [searchText, loading, options]
  );

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

  React.useEffect(() => {
    setLoading(autocompleteOpen);
    if (autocompleteOpen) {
      handleSearch();
    }
  }, [autocompleteOpen, searchText]);

  const handleAutocompleteSelect = (
    _: React.ChangeEvent<unknown>,
    value: FilterOption | string | null
  ) => {
    if (!value) return;
    setSelectedTerm(value as TermRef);
    setSearchText(typeof value === 'string' ? value : value.name);
    field.onChange(typeof value === 'string' ? value : value.id);
  };

  return (
    <Autocomplete
      {...field}
      sx={{ mt: 2 }}
      fullWidth
      id="dataentity-term-add-search"
      open={autocompleteOpen}
      onOpen={() => setAutocompleteOpen(true)}
      onClose={() => setAutocompleteOpen(false)}
      onChange={handleAutocompleteSelect}
      options={options}
      onInputChange={searchInputChange}
      getOptionLabel={getOptionLabel}
      filterOptions={getFilterOptions}
      loading={loading}
      handleHomeEndKeys
      selectOnFocus
      blurOnSelect
      freeSolo
      value={{ name: searchText }}
      clearIcon={<ClearIcon />}
      renderInput={params => (
        <AppInput
          {...params}
          ref={params.InputProps.ref}
          placeholder="Enter term name…"
          customEndAdornment={{
            variant: 'loader',
            showAdornment: loading,
            position: { mr: 4 },
          }}
        />
      )}
      renderOption={(props, option) =>
        option.id ? (
          <li {...props}>
            <Grid container flexWrap="wrap" flexDirection="column">
              <Typography variant="body1">{option.name}</Typography>
              <Typography variant="subtitle2">
                {option.namespace?.name}
              </Typography>
            </Grid>
          </li>
        ) : (
          <Typography
            sx={{ py: 0.5, px: 1 }}
            variant="subtitle2"
            component="span"
          >
            There are no terms
          </Typography>
        )
      }
    />
  );
};

export default TermsAutocomplete;
