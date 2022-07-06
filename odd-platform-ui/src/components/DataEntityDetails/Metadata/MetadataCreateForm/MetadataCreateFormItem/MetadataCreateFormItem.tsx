import React from 'react';
import {
  Autocomplete,
  Box,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import capitalize from 'lodash/capitalize';
import values from 'lodash/values';
import { createFilterOptions } from '@mui/material/useAutocomplete';
import { useDebouncedCallback } from 'use-debounce';
import { Controller, useFormContext } from 'react-hook-form';
import { MetadataField, MetadataFieldType } from 'generated-sources';
import MetadataValueEditField from 'components/DataEntityDetails/Metadata/MetadataValueEditor/MetadataValueEditor';
import AutocompleteSuggestion from 'components/shared/AutocompleteSuggestion/AutocompleteSuggestion';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import AppInput from 'components/shared/AppInput/AppInput';
import DropdownIcon from 'components/shared/Icons/DropdownIcon';
import AppMenuItem from 'components/shared/AppMenuItem/AppMenuItem';
import { useAppDispatch } from 'lib/redux/hooks';
import { searchMetadata } from 'redux/thunks/metadata.thunks';
import AppSelect from 'components/shared/AppSelect/AppSelect';

interface MetadataCreateFormItemProps {
  itemIndex: number;
}

const MetadataCreateFormItem: React.FC<MetadataCreateFormItemProps> = ({
  itemIndex,
}) => {
  const dispatch = useAppDispatch();

  const { register, control } = useFormContext();
  // Autocomplete
  type FilterOption = Omit<MetadataField, 'id' | 'type'> &
    Partial<MetadataField>;
  type FilterChangeOption = FilterOption | string | { inputValue: string };
  const [autocompleteOpen, setAutocompleteOpen] = React.useState(false);
  const [options, setOptions] = React.useState<FilterOption[]>([]);
  const [selectedField, setSelectedField] = React.useState<FilterOption>();
  const [selectedType, setSelectedType] = React.useState<
    MetadataFieldType | ''
  >('');
  const filter = createFilterOptions<FilterOption>();
  const [searchText, setSearchText] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(false);

  const handleSearch = React.useCallback(
    useDebouncedCallback(() => {
      setLoading(true);
      dispatch(searchMetadata({ query: searchText }))
        .unwrap()
        .then(({ metadataFields }) => {
          setOptions(metadataFields);
          setLoading(false);
        });
    }, 500),
    [setLoading, searchMetadata, setOptions, searchText]
  );

  React.useEffect(() => {
    setLoading(autocompleteOpen);
    if (autocompleteOpen) {
      handleSearch();
    }
  }, [autocompleteOpen, searchText]);

  const handleInputChange = (
    _: React.ChangeEvent<unknown>,
    query: string
  ) => {
    setSearchText(query);
  };

  const handleOptionChange = React.useCallback(
    (onChange: (val?: string) => void) =>
      (
        _: React.ChangeEvent<unknown>,
        newValue: FilterChangeOption | null
      ) => {
        let newType: MetadataFieldType | '' = '';
        let newField;
        if (newValue && typeof newValue === 'object') {
          // Selected value from search
          if ('type' in newValue && newValue.type) {
            newType = newValue.type;
          }
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
        setSelectedType(newType);
        setSelectedField(newField);
        onChange(newField?.name);
      },
    [setSelectedType, setSelectedField]
  );

  const getFilterOptions = React.useCallback(
    (filterOptions, params) => {
      const filtered = filter(options, params);
      // Suggest the creation of a new value
      if (
        params.inputValue !== '' &&
        !loading &&
        !options.some(option => option.name === params.inputValue)
      ) {
        return [
          ...options,
          {
            name: params.inputValue,
          },
        ];
      }

      return filtered;
    },
    [searchText, loading]
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

  const handleMetadataChange = (
    event: SelectChangeEvent<unknown>,
    onChange: (val: unknown) => void
  ) => {
    setSelectedType(event.target.value as MetadataFieldType);
    onChange(event.target.value);
  };

  return (
    <>
      <Controller
        name={`metadata.${itemIndex}.name`}
        defaultValue=""
        rules={{ required: true }}
        control={control}
        render={({ field }) => (
          <Autocomplete
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...field}
            fullWidth
            id="metadata-name-search"
            open={autocompleteOpen}
            onOpen={() => {
              setAutocompleteOpen(true);
            }}
            onClose={() => {
              setAutocompleteOpen(false);
            }}
            onChange={handleOptionChange(field.onChange)}
            onInputChange={handleInputChange}
            getOptionLabel={getOptionLabel}
            options={options}
            filterOptions={getFilterOptions}
            loading={loading}
            handleHomeEndKeys
            selectOnFocus
            clearIcon={<ClearIcon />}
            popupIcon={<DropdownIcon />}
            renderInput={params => (
              <AppInput
                {...params}
                {...register(`metadata[${itemIndex}].name`, {
                  required: true,
                })}
                ref={params.InputProps.ref}
                placeholder="Metadata Name"
                customEndAdornment={{
                  variant: 'loader',
                  showAdornment: loading,
                  position: { mr: -2 },
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
                      optionLabel="custom data"
                      optionName={option.name}
                    />
                  )}
                </Typography>
              </li>
            )}
          />
        )}
      />
      {selectedField && (
        <>
          <Box sx={{ mt: 1.5 }} display={selectedField.type ? 'none' : ''}>
            <Controller
              name={`metadata.${itemIndex}.type`}
              control={control}
              defaultValue={selectedType}
              rules={{ required: true }}
              render={({ field }) => (
                <AppSelect
                  {...field}
                  label="Type"
                  placeholder="Type"
                  disabled={!!selectedField?.type}
                  onChange={e => handleMetadataChange(e, field.onChange)}
                  value={selectedType}
                >
                  {values(MetadataFieldType).map(type => (
                    <AppMenuItem key={type} value={type}>
                      {capitalize(type)}
                    </AppMenuItem>
                  ))}
                </AppSelect>
              )}
            />
          </Box>
          <Box sx={{ mt: 1.5 }} display={selectedField.type ? '' : 'none'}>
            <Typography
              variant="body2"
              color="texts.secondary"
              component="span"
              sx={{ mr: 0.5 }}
            >
              Type:
            </Typography>
            {capitalize(selectedType)}
          </Box>
          <Box sx={{ mt: 1.5 }}>
            <MetadataValueEditField
              fieldName={`metadata.${itemIndex}.value`}
              metadataType={selectedType}
              labeled
            />
          </Box>
        </>
      )}
    </>
  );
};

export default MetadataCreateFormItem;
