import React from 'react';
import { Autocomplete, MenuItem, Typography } from '@mui/material';
import { capitalize, values } from 'lodash';
import { createFilterOptions } from '@mui/material/useAutocomplete';
import { useDebouncedCallback } from 'use-debounce/lib';
import { Controller, useFormContext } from 'react-hook-form';
import {
  MetadataApiGetMetadataFieldListRequest,
  MetadataField,
  MetadataFieldList,
  MetadataFieldType,
} from 'generated-sources';
import MetadataValueEditField from 'components/DataEntityDetails/Metadata/MetadataValueEditor/MetadataValueEditor';
import cx from 'classnames';
import AutocompleteSuggestion from 'components/shared/AutocompleteSuggestion/AutocompleteSuggestion';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import AppTextField from 'components/shared/AppTextField/AppTextField';
import DropdownIcon from 'components/shared/Icons/DropdownIcon';
import { StylesType } from './MetadataCreateFormItemStyles';

interface MetadataCreateFormItemProps extends StylesType {
  itemIndex: number;
  onItemRemove: () => void;
  searchMetadata: (
    params: MetadataApiGetMetadataFieldListRequest
  ) => Promise<MetadataFieldList>;
}

const MetadataCreateFormItem: React.FC<MetadataCreateFormItemProps> = ({
  classes,
  itemIndex,
  onItemRemove,
  searchMetadata,
}) => {
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
      searchMetadata({ query: searchText }).then(response => {
        setOptions(response.items);
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
    (onChange: (val?: string) => void) => (
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

  return (
    <>
      <Controller
        name={`metadata.${itemIndex}.name`}
        defaultValue=""
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
              <AppTextField
                {...params}
                {...register(`metadata[${itemIndex}].name`, {
                  required: true,
                })}
                ref={params.InputProps.ref}
                placeholder="Metadata Name"
                customEndAdornment={{
                  variant: 'loader',
                  isShow: loading,
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
          <div
            className={cx(classes.metadataTypeContainer, {
              [classes.hidden]: selectedField.type,
            })}
          >
            <Controller
              name={`metadata.${itemIndex}.type`}
              control={control}
              defaultValue={selectedType}
              rules={{ required: true }}
              render={({ field }) => (
                <AppTextField
                  {...field}
                  label="Type"
                  placeholder="Type"
                  select
                  disabled={!!selectedField?.type}
                  inputProps={{
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                      setSelectedType(e.target.value as MetadataFieldType);
                    },
                  }}
                >
                  {values(MetadataFieldType).map(type => (
                    <MenuItem key={type} value={type}>
                      {capitalize(type)}
                    </MenuItem>
                  ))}
                </AppTextField>
              )}
            />
          </div>
          <div
            className={cx(classes.typeContainer, {
              [classes.hidden]: !selectedField.type,
            })}
          >
            <span className={classes.typeTitle}>Type:</span>
            {capitalize(selectedType)}
          </div>
          <div className={classes.metadataValueContainer}>
            <MetadataValueEditField
              fieldName={`metadata.${itemIndex}.value`}
              metadataType={selectedType}
              labeled
            />
          </div>
        </>
      )}
    </>
  );
};

export default MetadataCreateFormItem;
