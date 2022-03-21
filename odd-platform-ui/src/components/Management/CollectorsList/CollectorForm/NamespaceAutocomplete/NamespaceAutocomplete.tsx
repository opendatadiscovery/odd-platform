import React from 'react';
import { Autocomplete, Typography } from '@mui/material';
import {
  AutocompleteInputChangeReason,
  createFilterOptions,
} from '@mui/material/useAutocomplete';
import { useDebouncedCallback } from 'use-debounce';
import {
  Namespace,
  NamespaceApiGetNamespaceListRequest,
  NamespaceList,
} from 'generated-sources';
import AutocompleteSuggestion from 'components/shared/AutocompleteSuggestion/AutocompleteSuggestion';
import AppTextField from 'components/shared/AppTextField/AppTextField';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import { ControllerRenderProps } from 'react-hook-form';
import { CollectorFormDataValues } from 'components/Management/CollectorsList/CollectorForm/CollectorForm';

type FilterOption = Omit<Namespace, 'id' | 'namespace'> &
  Partial<Namespace>;

interface NamespaceAutocompleteProps {
  searchNamespace: (
    params: NamespaceApiGetNamespaceListRequest
  ) => Promise<NamespaceList>;
  controllerProps: ControllerRenderProps<
    CollectorFormDataValues,
    'namespaceName'
  >;
}

const NamespaceAutocomplete: React.FC<NamespaceAutocompleteProps> = ({
  searchNamespace,
  controllerProps,
}) => {
  type FilterChangeOption = FilterOption | string | { inputValue: string };
  const [autocompleteOpen, setAutocompleteOpen] = React.useState(false);
  const [options, setOptions] = React.useState<FilterOption[]>([]);
  const filter = createFilterOptions<FilterOption>();
  const [searchText, setSearchText] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);

  const handleSearch = React.useCallback(
    useDebouncedCallback(() => {
      setLoading(true);
      searchNamespace({ query: searchText, page: 1, size: 30 }).then(
        response => {
          setOptions(response.items);
          setLoading(false);
        }
      );
    }, 500),
    [searchNamespace, setLoading, setOptions, searchText]
  );

  const getOptionLabel = React.useCallback((option: FilterOption) => {
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
    (filterOptions, params) => {
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
    (onChange: (val?: string) => void) => (
      _: React.ChangeEvent<unknown>,
      newValue: FilterChangeOption | null
    ) => {
      let newField;
      if (newValue && typeof newValue === 'object') {
        if ('name' in newValue) {
          newField = newValue;
        }
      }

      // Create value from keyboard
      if (typeof newValue === 'string') {
        newField = {
          name: newValue,
        };
      }
      onChange(newField?.name || '');
    },
    []
  );

  return (
    <Autocomplete
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...controllerProps}
      fullWidth
      id="namespace-name-search"
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
        <AppTextField
          {...params}
          ref={params.InputProps.ref}
          placeholder="Namespace"
          label="Namespace"
          customEndAdornment={{
            variant: 'loader',
            showAdornment: loading,
            position: { mr: 4 },
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props}>
          <Typography variant="body2">
            {option.id ? (
              option.name
            ) : (
              <AutocompleteSuggestion
                optionLabel="custom namespace"
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
