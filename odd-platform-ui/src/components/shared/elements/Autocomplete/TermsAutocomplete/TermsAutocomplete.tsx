import React from 'react';
import { Autocomplete, Grid, Typography } from '@mui/material';
import type {
  DataEntityTermFormData,
  TermRef,
  CollectorFormData,
} from 'generated-sources';
import {
  type AutocompleteInputChangeReason,
  createFilterOptions,
  type FilterOptionsState,
} from '@mui/material/useAutocomplete';
import { useDebouncedCallback } from 'use-debounce';
import ClearIcon from 'components/shared/icons/ClearIcon';
import { type ControllerRenderProps } from 'react-hook-form';
import { useAppDispatch } from 'redux/lib/hooks';
import { fetchTermsList } from 'redux/thunks';
import Input from 'components/shared/elements/Input/Input';

interface TermsAutocompleteProps {
  setSelectedTerm: (term: TermRef) => void;
  field:
    | ControllerRenderProps<DataEntityTermFormData, 'termId'>
    | ControllerRenderProps<CollectorFormData, 'namespaceName'>;
}

const TermsAutocomplete: React.FC<TermsAutocompleteProps> = ({
  setSelectedTerm,
  field,
}) => {
  const dispatch = useAppDispatch();
  const searchTerms = fetchTermsList;

  type FilterOption = Omit<TermRef, 'id' | 'definition' | 'namespace'> & Partial<TermRef>;
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

  const getOptionLabel = React.useCallback((option: FilterOption | string) => {
    if (typeof option === 'string') {
      return option;
    }
    if ('name' in option && option.name) {
      return option.name;
    }
    return '';
  }, []);

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

  const handleAutocompleteSelect = (
    _: React.ChangeEvent<unknown>,
    value: FilterOption | string | null
  ) => {
    if (!value) return;
    setSelectedTerm(value as TermRef);
    setSearchText(typeof value === 'string' ? value : value.name);
    field.onChange(typeof value === 'string' ? value : value.id);
  };

  const getFilterOptions = React.useCallback(
    (filterOptions: FilterOption[], params: FilterOptionsState<FilterOption>) => {
      const filtered = filter(options, params);

      if (!loading && filtered.length === 0) return [{ name: '' }];

      return filtered;
    },
    [searchText, loading, options]
  );

  React.useEffect(() => {
    setLoading(autocompleteOpen);
    if (autocompleteOpen) {
      handleSearch();
    }
  }, [autocompleteOpen, searchText]);

  return (
    <Autocomplete
      {...field}
      sx={{ mt: 2 }}
      fullWidth
      id='dataentity-term-add-search'
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
        <Input
          variant='main-m'
          inputContainerRef={params.InputProps.ref}
          inputProps={params.inputProps}
          placeholder='Enter term name…'
          isLoading={loading}
        />
      )}
      renderOption={(props, option) =>
        option.id ? (
          <li {...props}>
            <Grid container flexWrap='wrap' flexDirection='column'>
              <Typography variant='body1'>{option.name}</Typography>
              <Typography variant='subtitle2'>{option.namespace?.name}</Typography>
            </Grid>
          </li>
        ) : (
          <Typography sx={{ py: 0.5, px: 1 }} variant='subtitle2' component='span'>
            There are no terms
          </Typography>
        )
      }
    />
  );
};

export default TermsAutocomplete;
