import React from 'react';
import { Autocomplete, Typography } from '@mui/material';
import {
  type AutocompleteInputChangeReason,
  createFilterOptions,
  type FilterOptionsState,
} from '@mui/material/useAutocomplete';
import { useDebouncedCallback } from 'use-debounce';
import type {
  CollectorFormData,
  DataEntityGroupFormData,
  Namespace,
  TermFormData,
} from 'generated-sources';
import { ClearIcon } from 'components/shared/icons';
import { type ControllerRenderProps } from 'react-hook-form';
import { useAppDispatch } from 'redux/lib/hooks';
import { fetchNamespaceList as searchNamespace } from 'redux/thunks';
import type { DataSourceFormDataValues } from 'components/Management/DataSourcesList/DataSourceForm/DataSourceForm';
import AutocompleteSuggestion from 'components/shared/elements/AutocompleteSuggestion/AutocompleteSuggestion';
import Input from 'components/shared/elements/Input/Input';

type FilterOption = Omit<Namespace, 'id' | 'name'> & Partial<Namespace>;

interface NamespaceAutocompleteProps {
  controllerProps:
    | ControllerRenderProps<TermFormData, 'namespaceName'>
    | ControllerRenderProps<DataEntityGroupFormData, 'namespaceName'>
    | ControllerRenderProps<DataSourceFormDataValues, 'namespaceName'>
    | ControllerRenderProps<CollectorFormData, 'namespaceName'>;
}

const NamespaceAutocomplete: React.FC<NamespaceAutocompleteProps> = ({
  controllerProps,
}) => {
  const dispatch = useAppDispatch();

  type FilterChangeOption = FilterOption | string | { inputValue: string };
  const [autocompleteOpen, setAutocompleteOpen] = React.useState(false);
  const [options, setOptions] = React.useState<FilterOption[]>([]);
  const filter = createFilterOptions<FilterOption>();
  const [searchText, setSearchText] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);

  const handleSearch = React.useCallback(
    useDebouncedCallback(() => {
      setLoading(true);
      dispatch(searchNamespace({ query: searchText, page: 1, size: 30 }))
        .unwrap()
        .then(({ namespaceList }) => {
          setOptions(namespaceList);
          setLoading(false);
        });
    }, 500),
    [searchNamespace, setLoading, setOptions, searchText]
  );

  const getOptionLabel = React.useCallback((option: FilterOption | string) => {
    // Value selected with enter, right from the input
    if (typeof option === 'string') {
      return option;
    }
    // Regular option
    if ('name' in option && option.name) {
      return option.name;
    }
    return '';
  }, []);

  const getFilterOptions = React.useCallback(
    (filterOptions: FilterOption[], params: FilterOptionsState<FilterOption>) => {
      const filtered = filter(options, params);
      // Suggest the creation of a new value
      if (
        searchText !== '' &&
        !loading &&
        !options.some(option => option.name === params.inputValue)
      ) {
        return [...options, { name: params.inputValue }];
      }

      return filtered;
    },
    [loading, searchText, options]
  );

  const handleInputChange = React.useCallback(
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

  const handleOptionChange = React.useCallback(
    (onChange: (val?: string) => void) =>
      (_: React.ChangeEvent<unknown>, newValue: FilterChangeOption | null) => {
        let newField;
        if (newValue && typeof newValue === 'object') {
          if ('name' in newValue) {
            newField = newValue;
          }
        }

        // Create value from keyboard
        if (typeof newValue === 'string') {
          newField = { name: newValue };
        }
        onChange(newField?.name || '');
      },
    []
  );

  return (
    <Autocomplete
      {...controllerProps}
      fullWidth
      id='namespace-name-search'
      open={autocompleteOpen}
      onOpen={() => {
        setAutocompleteOpen(true);
      }}
      onClose={() => {
        setAutocompleteOpen(false);
      }}
      onChange={handleOptionChange(controllerProps.onChange)}
      onInputChange={handleInputChange}
      getOptionLabel={getOptionLabel}
      options={options}
      filterOptions={getFilterOptions}
      loading={loading}
      freeSolo
      handleHomeEndKeys
      selectOnFocus
      clearIcon={<ClearIcon />}
      sx={{ mt: 1.25 }}
      renderInput={params => (
        <Input
          variant='main-m'
          inputContainerRef={params.InputProps.ref}
          inputProps={params.inputProps}
          label='Namespace'
          placeholder='Namespace'
          isLoading={loading}
        />
      )}
      renderOption={(props, option: FilterOption) => (
        <li {...props}>
          <Typography variant='body2'>
            {option.id ? (
              option.name
            ) : (
              <AutocompleteSuggestion
                optionLabel='custom namespace'
                optionName={option.name}
              />
            )}
          </Typography>
        </li>
      )}
    />
  );
};

export default NamespaceAutocomplete;
