import React from 'react';
import { Autocomplete, Typography } from '@mui/material';
import {
  AutocompleteInputChangeReason,
  createFilterOptions,
} from '@mui/material/useAutocomplete';
import { fetchLabelsList as searchLabels } from 'redux/thunks/labels.thunks';
import { useAppDispatch } from 'lib/redux/hooks';

import { useDebouncedCallback } from 'use-debounce';
import { Label } from 'generated-sources';
import AutocompleteSuggestion from 'components/shared/AutocompleteSuggestion/AutocompleteSuggestion';
import AppTextField from 'components/shared/AppTextField/AppTextField';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import { UseFieldArrayReturn } from 'react-hook-form';

type FilterOption = Omit<Label, 'id'> & Partial<Label>;

interface LabelsAutocompleteProps {
  appendLabel: UseFieldArrayReturn['append'];
}

const LabelsAutocomplete: React.FC<LabelsAutocompleteProps> = ({
  appendLabel,
}) => {
  const dispatch = useAppDispatch();

  const [options, setOptions] = React.useState<FilterOption[]>([]);
  const [autocompleteOpen, setAutocompleteOpen] = React.useState(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [searchText, setSearchText] = React.useState<string>('');
  const filter = createFilterOptions<FilterOption>();

  const handleSearch = React.useCallback(
    useDebouncedCallback(() => {
      setLoading(true);
      dispatch(searchLabels({ page: 1, size: 30, query: searchText }))
        .unwrap()
        .then(({ items }) => {
          setLoading(false);
          setOptions(items);
        });
    }, 500),
    [searchLabels, setLoading, setOptions, searchText]
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
    setSearchText(''); // Clear input on select
    appendLabel(typeof value === 'string' ? { name: value } : value);
  };

  return (
    <Autocomplete
      fullWidth
      id="datasetfield-label-add-name-search"
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
        <AppTextField
          {...params}
          sx={{ mt: 1.5 }}
          ref={params.InputProps.ref}
          placeholder="Enter label name…"
          label="Label"
          customEndAdornment={{
            variant: 'loader',
            showAdornment: loading,
            position: { mr: 4 },
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props}>
          <Typography variant="body1">
            {option.id ? (
              option.name
            ) : (
              <AutocompleteSuggestion
                optionLabel="label"
                optionName={option.name}
              />
            )}
          </Typography>
        </li>
      )}
    />
  );
};

export default LabelsAutocomplete;
