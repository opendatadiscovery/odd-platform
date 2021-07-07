import React from 'react';
import {
  CircularProgress,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@material-ui/core';
import { capitalize, values } from 'lodash';
import { Autocomplete, createFilterOptions } from '@material-ui/lab';
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
        render={({ field: { onChange } }) => (
          <Autocomplete
            fullWidth
            id="metadata-name-search"
            open={autocompleteOpen}
            onOpen={() => {
              setAutocompleteOpen(true);
            }}
            onClose={() => {
              setAutocompleteOpen(false);
            }}
            onChange={handleOptionChange(onChange)}
            onInputChange={handleInputChange}
            getOptionLabel={getOptionLabel}
            options={options}
            filterOptions={getFilterOptions}
            loading={loading}
            handleHomeEndKeys
            selectOnFocus
            renderInput={params => (
              <TextField
                {...params}
                {...register(`metadata[${itemIndex}].name`, {
                  required: true,
                })}
                placeholder="Metadata Name"
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={option => (
              <Typography variant="body2">
                {option.id
                  ? option.name
                  : `No result. Create new custom data "${option.name}"`}
              </Typography>
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
                <>
                  <InputLabel shrink id="metadata-type">
                    Type
                  </InputLabel>
                  <Select
                    {...field}
                    fullWidth
                    variant="outlined"
                    placeholder="Type"
                    labelId="metadata-type"
                    disabled={!!selectedField?.type}
                    inputProps={{
                      onChange: (
                        e: React.ChangeEvent<HTMLInputElement>
                      ) => {
                        setSelectedType(
                          e.target.value as MetadataFieldType
                        );
                      },
                    }}
                  >
                    {values(MetadataFieldType).map(type => (
                      <MenuItem key={type} value={type}>
                        {capitalize(type)}
                      </MenuItem>
                    ))}
                  </Select>
                </>
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
