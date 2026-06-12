import React, { useCallback, useEffect, useState } from 'react';
import { Autocomplete, Grid, Typography } from '@mui/material';
import {
  type AutocompleteInputChangeReason,
  createFilterOptions,
  type FilterOptionsState,
} from '@mui/material/useAutocomplete';
import { useDebouncedCallback } from 'use-debounce';
import { type ControllerRenderProps } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { QueryExampleRef } from 'generated-sources';
import ClearIcon from 'components/shared/icons/ClearIcon';
import Input from 'components/shared/elements/Input/Input';
import { useQueryClient } from '@tanstack/react-query';
import { queryExampleApi } from 'lib/api';

interface QueryExamplesAutocompleteProps {
  field: ControllerRenderProps<{ exampleId: number }>;
}

const QueryExamplesAutocomplete: React.FC<QueryExamplesAutocompleteProps> = ({
  field,
}) => {
  const { t } = useTranslation();
  type FilterOption = Omit<QueryExampleRef, 'id' | 'query'> & Partial<QueryExampleRef>;
  const [options, setOptions] = useState<FilterOption[]>([]);
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const [query, setQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const filter = createFilterOptions<FilterOption>();

  const handleSearch = useCallback(
    useDebouncedCallback(() => {
      setIsLoading(true);
      queryClient
        .fetchQuery({
          queryKey: ['queryExamplesSuggestions', { query }],
          queryFn: () => queryExampleApi.getQueryExampleSearchSuggestions({ query }),
        })
        .then(({ items }) => {
          setIsLoading(false);
          setOptions(items);
        });
    }, 500),
    [setIsLoading, setOptions, query]
  );

  const getOptionLabel = useCallback((option: FilterOption | string) => {
    if (typeof option === 'string') {
      return option;
    }
    if ('definition' in option && option.definition) {
      return option.definition;
    }

    return '';
  }, []);

  const handleInput = (input: string) => {
    setQuery(input);
    setAutocompleteOpen(!!input);
  };

  const handleSelection = () => {
    setQuery(''); // Clear input on select
    setAutocompleteOpen(false);
  };

  const searchInputChange = useCallback(
    (
      _: React.ChangeEvent<unknown>,
      input: string,
      reason: AutocompleteInputChangeReason
    ) => {
      if (reason === 'input') {
        handleInput(input);
      } else {
        handleSelection();
      }
    },
    [setQuery]
  );

  const handleAutocompleteSelect = (
    _: React.ChangeEvent<unknown>,
    value: FilterOption | string | null
  ) => {
    if (!value) return;
    setQuery(typeof value === 'string' ? value : value.definition);
    field.onChange(typeof value === 'string' ? value : value.id);
  };

  const getFilterOptions = useCallback(
    (_filterOptions: FilterOption[], params: FilterOptionsState<FilterOption>) => {
      const filtered = filter(options, params);

      if (!isLoading && filtered.length === 0) return [{ definition: '' }];

      return filtered;
    },
    [query, isLoading, options]
  );

  useEffect(() => {
    setIsLoading(autocompleteOpen);
    if (autocompleteOpen) {
      handleSearch();
    }
  }, [autocompleteOpen, query]);

  return (
    <Autocomplete
      {...field}
      sx={{ mt: 2 }}
      fullWidth
      id='query-examples-autocomplete'
      open={autocompleteOpen}
      onOpen={() => query && setAutocompleteOpen(true)}
      onClose={() => setAutocompleteOpen(false)}
      onChange={handleAutocompleteSelect}
      options={options}
      onInputChange={searchInputChange}
      getOptionLabel={getOptionLabel}
      filterOptions={getFilterOptions}
      loading={isLoading}
      handleHomeEndKeys
      selectOnFocus
      blurOnSelect
      freeSolo
      value={query}
      clearIcon={<ClearIcon />}
      renderInput={params => (
        <Input
          variant='main-m'
          inputContainerRef={params.InputProps.ref}
          inputProps={params.inputProps}
          placeholder={t('Enter query example definition')}
          isLoading={isLoading}
        />
      )}
      renderOption={(props, option) =>
        option.id ? (
          <li {...props}>
            <Grid container flexWrap='wrap' flexDirection='column'>
              <Typography variant='body1'>{option.definition}</Typography>
            </Grid>
          </li>
        ) : (
          <Typography sx={{ py: 0.5, px: 1 }} variant='subtitle2' component='span'>
            {t('There are no query examples')}
          </Typography>
        )
      }
    />
  );
};

export default QueryExamplesAutocomplete;
