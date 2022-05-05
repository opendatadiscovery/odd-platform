import React from 'react';
import { Typography } from '@mui/material';
import {
  DataEntityGroupFormData,
  DataEntityRef,
  SearchApiGetSearchSuggestionsRequest,
} from 'generated-sources';
import EntityClassItem from 'components/shared/EntityClassItem/EntityClassItem';
import { useDebouncedCallback } from 'use-debounce';
import AppTextField from 'components/shared/AppTextField/AppTextField';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import { ControllerRenderProps } from 'react-hook-form';
import * as S from './EntitiesSuggestionsAutocompleteStyles';

interface EntitiesSuggestionsAutocompleteProps {
  fetchEntitiesSuggestions: (
    params: SearchApiGetSearchSuggestionsRequest
  ) => Promise<DataEntityRef[]>;
  entitiesSuggestions: DataEntityRef[];
  isEntitiesSuggestionsLoading: boolean;
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
}) => {
  const [searchText, setSearchText] = React.useState<string>('');
  const [options, setOptions] = React.useState<Partial<DataEntityRef>[]>(
    []
  );
  const [autocompleteOpen, setAutocompleteOpen] =
    React.useState<boolean>(false);

  const handleInputChange = (
    _: React.ChangeEvent<unknown>,
    inputVal: string
  ) => {
    setSearchText(inputVal);
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

  const renderOption = (
    props: React.HTMLAttributes<HTMLLIElement>,
    option: unknown
  ): React.ReactNode => {
    const typedOption = option as DataEntityRef;
    return (
      <li {...props}>
        <Typography variant="body1" sx={{ mr: 1 }}>
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
    <S.Container>
      <S.Search>
        <S.SearchAutocomplete
          fullWidth
          value={{ externalName: searchText }}
          id="data-entity-search"
          open={autocompleteOpen}
          onOpen={() => {
            if (searchText) setAutocompleteOpen(true);
          }}
          onClose={() => {
            setAutocompleteOpen(false);
          }}
          onInputChange={handleInputChange}
          getOptionLabel={getOptionLabel}
          options={options}
          loading={isEntitiesSuggestionsLoading}
          freeSolo
          filterOptions={option => option}
          clearIcon={<ClearIcon />}
          renderInput={params => (
            <AppTextField
              {...params}
              ref={params.InputProps.ref}
              size="large"
              customEndAdornment={{
                variant: 'loader',
                showAdornment: isEntitiesSuggestionsLoading,
                position: { mr: 4 },
              }}
            />
          )}
          renderOption={renderOption}
        />
      </S.Search>
    </S.Container>
  );
};

export default EntitiesSuggestionsAutocomplete;
