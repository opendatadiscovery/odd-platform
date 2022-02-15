import React from 'react';
import { Typography } from '@mui/material';
import { useHistory } from 'react-router-dom';
import {
  DataEntityRef,
  SearchApiGetSearchSuggestionsRequest,
  SearchApiSearchRequest,
  SearchFacetsData,
} from 'generated-sources';
import { dataEntityDetailsPath, searchPath } from 'lib/paths';
import * as S from 'components/shared/MainSearch/MainSearchStyles';
import EntityTypeItem from 'components/shared/EntityTypeItem/EntityTypeItem';
import { useDebouncedCallback } from 'use-debounce';
import AppTextField from 'components/shared/AppTextField/AppTextField';
import ClearIcon from 'components/shared/Icons/ClearIcon';
import SearchIcon from 'components/shared/Icons/SearchIcon';

interface AppSearchProps {
  className?: string;
  query?: string;
  placeholder?: string;
  suggestions: DataEntityRef[];
  fetchSearchSuggestions: (
    params: SearchApiGetSearchSuggestionsRequest
  ) => Promise<DataEntityRef[]>;
  createDataEntitiesSearch: (
    params: SearchApiSearchRequest
  ) => Promise<SearchFacetsData>;
}

const MainSearch: React.FC<AppSearchProps> = ({
  placeholder,
  query,
  suggestions,
  fetchSearchSuggestions,
  createDataEntitiesSearch,
}) => {
  const [searchText, setSearchText] = React.useState<string>('');
  const [options, setOptions] = React.useState<Partial<DataEntityRef>[]>(
    []
  );
  const [autocompleteOpen, setAutocompleteOpen] = React.useState<boolean>(
    false
  );
  const [
    loadingSuggestions,
    setLoadingSuggestions,
  ] = React.useState<boolean>(false);

  const history = useHistory();

  const createSearch = () => {
    const searchQuery = {
      query: searchText,
      pageSize: 30,
      filters: {},
    };
    createDataEntitiesSearch({ searchFormData: searchQuery }).then(
      search => {
        const searchLink = searchPath(search.searchId);
        history.replace(searchLink);
      }
    );
    history.push(searchPath());
  };

  const handleInputChange = (
    _: React.ChangeEvent<unknown>,
    inputVal: string
  ) => {
    setSearchText(inputVal);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      createSearch();
    }
  };

  const getSuggestions = React.useCallback(
    useDebouncedCallback(() => {
      fetchSearchSuggestions({ query: searchText }).then(() => {
        setLoadingSuggestions(false);
      });
    }, 500),
    [searchText, setOptions, setLoadingSuggestions, fetchSearchSuggestions]
  );

  React.useEffect(() => {
    setSearchText(query || '');
  }, [query]);

  React.useEffect(() => {
    setOptions(suggestions);
  }, [suggestions]);

  React.useEffect(() => {
    if (!searchText) return;
    setLoadingSuggestions(autocompleteOpen);
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
        <S.SuggestionItem
          to={typedOption.id ? dataEntityDetailsPath(typedOption.id) : '#'}
        >
          <Typography variant="body1" sx={{ mr: 1 }}>
            {typedOption.internalName || typedOption.externalName}
          </Typography>
          {typedOption.types?.map(type => (
            <EntityTypeItem
              sx={{ mr: 0.5 }}
              key={type.id}
              typeName={type.name}
            />
          ))}
        </S.SuggestionItem>
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
          loading={loadingSuggestions}
          freeSolo
          filterOptions={option => option}
          clearIcon={<ClearIcon />}
          renderInput={params => (
            <AppTextField
              {...params}
              ref={params.InputProps.ref}
              size="large"
              placeholder={
                placeholder ||
                'Search data tables, feature groups, jobs and ML models via keywords'
              }
              onKeyDown={handleKeyDown}
              customStartAdornment={{
                variant: 'search',
                showAdornment: true,
                onCLick: createSearch,
                icon: <SearchIcon />,
              }}
              customEndAdornment={{
                variant: 'loader',
                showAdornment: loadingSuggestions,
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

export default MainSearch;
