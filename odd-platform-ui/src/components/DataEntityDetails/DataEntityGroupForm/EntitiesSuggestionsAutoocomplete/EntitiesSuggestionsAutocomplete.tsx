import React from 'react';
import { Autocomplete, Grid, Typography } from '@mui/material';
import {
  DataEntityGroupFormData as GeneratedDataEntityGroupFormData,
  DataEntityRef,
  DataEntityType,
  SearchApiGetSearchSuggestionsRequest,
} from 'generated-sources';
import EntityClassItem from 'components/shared/EntityClassItem/EntityClassItem';
import { useDebouncedCallback } from 'use-debounce';
import AppTextField from 'components/shared/AppTextField/AppTextField';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import { ControllerRenderProps } from 'react-hook-form';
import AppButton from 'components/shared/AppButton/AppButton';
import { UseFieldArrayAppend } from 'react-hook-form/dist/types/fieldArray';

interface DataEntityGroupFormData
  extends Omit<GeneratedDataEntityGroupFormData, 'type'> {
  type?: DataEntityType;
}

interface EntitiesSuggestionsAutocompleteProps {
  fetchEntitiesSuggestions: (
    params: SearchApiGetSearchSuggestionsRequest
  ) => Promise<DataEntityRef[]>;
  entitiesSuggestions: DataEntityRef[];
  isEntitiesSuggestionsLoading: boolean;
  append: UseFieldArrayAppend<DataEntityGroupFormData['entities']>;
  controllerProps: ControllerRenderProps<
    DataEntityGroupFormData,
    'entities'
  >;
}

const EntitiesSuggestionsAutocomplete: React.FC<
  EntitiesSuggestionsAutocompleteProps
> = ({
  fetchEntitiesSuggestions,
  entitiesSuggestions,
  isEntitiesSuggestionsLoading,
  append,
  controllerProps,
}) => {
  const [searchText, setSearchText] = React.useState<string>('');
  const [options, setOptions] = React.useState<Partial<DataEntityRef>[]>(
    []
  );
  const [selectedOption, setSelectedOption] =
    React.useState<DataEntityRef | null>(null);
  const [autocompleteOpen, setAutocompleteOpen] =
    React.useState<boolean>(false);

  const handleInputChange = (
    _: React.ChangeEvent<unknown>,
    inputVal: string,
    reason: string
  ) => {
    setSearchText(inputVal);
    if (reason === 'clear') {
      setSelectedOption(null);
    }
  };

  const getSuggestions = React.useCallback(
    useDebouncedCallback(() => {
      fetchEntitiesSuggestions({ query: searchText });
    }, 500),
    [searchText, fetchEntitiesSuggestions]
  );

  React.useEffect(() => {
    setOptions(entitiesSuggestions);
  }, [entitiesSuggestions]);

  React.useEffect(() => {
    if (!searchText) return;
    if (autocompleteOpen) {
      getSuggestions();
    }
  }, [autocompleteOpen, searchText]);

  const getOptionLabel = (option: unknown) => {
    const typedOption = option as DataEntityRef;
    return typedOption.internalName || typedOption.externalName || '';
  };

  const handleAutocompleteSelect = (
    _: React.ChangeEvent<unknown>,
    value: Partial<DataEntityRef> | string | null
  ) => {
    if (!value) return;
    setSelectedOption(value as DataEntityRef);
  };

  const handleAddEntity = () => {
    append(selectedOption as DataEntityRef);
    setSearchText('');
    setSelectedOption(null);
  };

  const renderOption = (
    props: React.HTMLAttributes<HTMLLIElement>,
    option: unknown
  ): React.ReactNode => {
    const typedOption = option as DataEntityRef;
    return (
      <li {...props}>
        <Typography
          variant="body1"
          sx={{ mr: 1 }}
          noWrap
          title={typedOption.internalName || typedOption.externalName}
        >
          {typedOption.internalName || typedOption.externalName}
        </Typography>
        {typedOption.entityClasses?.map(entityClass => (
          <EntityClassItem
            sx={{ mr: 0.5 }}
            key={entityClass.id}
            entityClassName={entityClass.name}
          />
        ))}
      </li>
    );
  };

  return (
    <Autocomplete
      {...controllerProps}
      fullWidth
      value={{ externalName: searchText }}
      id="entities-for-dataentitygroup-search"
      open={autocompleteOpen}
      onOpen={() => {
        if (searchText) setAutocompleteOpen(true);
      }}
      onClose={() => {
        setAutocompleteOpen(false);
      }}
      onInputChange={handleInputChange}
      onChange={handleAutocompleteSelect}
      getOptionLabel={getOptionLabel}
      options={options}
      loading={isEntitiesSuggestionsLoading}
      freeSolo
      filterOptions={option => option}
      clearIcon={<ClearIcon />}
      sx={{ mt: 1.5 }}
      renderInput={params => (
        <Grid container flexWrap="nowrap" alignItems="center">
          <AppTextField
            {...params}
            ref={params.InputProps.ref}
            label="Entities"
            customEndAdornment={{
              variant: 'loader',
              showAdornment: isEntitiesSuggestionsLoading,
              position: { mr: 4 },
            }}
          />
          <AppButton
            sx={{ mt: 2, ml: 0.5 }}
            size="large"
            color="primaryLight"
            onClick={handleAddEntity}
            disabled={selectedOption === null}
          >
            Add
          </AppButton>
        </Grid>
      )}
      renderOption={renderOption}
    />
  );
};

export default EntitiesSuggestionsAutocomplete;
