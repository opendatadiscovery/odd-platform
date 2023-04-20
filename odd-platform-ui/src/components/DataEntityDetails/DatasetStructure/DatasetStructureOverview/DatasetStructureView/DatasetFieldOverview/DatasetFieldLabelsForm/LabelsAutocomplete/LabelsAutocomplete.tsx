import React from 'react';
import { Autocomplete, Typography } from '@mui/material';
import type {
  AutocompleteInputChangeReason,
  FilterOptionsState,
} from '@mui/material/useAutocomplete';
import { createFilterOptions } from '@mui/material/useAutocomplete';
import { fetchLabelsList as searchLabels } from 'redux/thunks';
import { useAppDispatch } from 'redux/lib/hooks';
import { useDebouncedCallback } from 'use-debounce';
import type { Label } from 'generated-sources';
import { AppInput, AutocompleteSuggestion } from 'components/shared/elements';
import { ClearIcon } from 'components/shared/icons';
import type { UseFieldArrayAppend } from 'react-hook-form/dist/types/fieldArray';

type FilterOption = Omit<Label, 'id'> & Partial<Label>;
type DatasetFieldLabelsFormData = {
  labels: Omit<Label, 'id'>[];
};

interface LabelsAutocompleteProps {
  appendLabel: UseFieldArrayAppend<DatasetFieldLabelsFormData, 'labels'>;
}

const LabelsAutocomplete: React.FC<LabelsAutocompleteProps> = ({ appendLabel }) => {
  const dispatch = useAppDispatch();

  const [options, setOptions] = React.useState<FilterOption[]>([]);
  const [autocompleteOpen, setAutocompleteOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [searchText, setSearchText] = React.useState('');
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

  const getOptionLabel = React.useCallback((option: FilterOption | string) => {
    if (typeof option === 'string') {
      return option;
    }
    if ('name' in option && option.name) {
      return option.name;
    }
    return '';
  }, []);

  const getFilterOptions = React.useCallback(
    (filterOptions: FilterOption[], params: FilterOptionsState<FilterOption>) => {
      const filtered = filter(options, params);
      if (
        searchText !== '' &&
        !loading &&
        !options.find(
          option => option.name.toLocaleLowerCase() === searchText.toLocaleLowerCase()
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
    appendLabel(
      typeof value === 'string' ? { name: value } : { ...value, external: false }
    );
  };

  return (
    <Autocomplete
      fullWidth
      id='datasetfield-label-add-name-search'
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
          placeholder='Enter label name…'
          label='Label'
          customEndAdornment={{
            variant: 'loader',
            showAdornment: loading,
            position: { mr: 4 },
          }}
        />
      )}
      renderOption={(props, option) => (
        <li {...props}>
          <Typography variant='body1'>
            {option.id ? (
              option.name
            ) : (
              <AutocompleteSuggestion optionLabel='label' optionName={option.name} />
            )}
          </Typography>
        </li>
      )}
    />
  );
};

export default LabelsAutocomplete;
