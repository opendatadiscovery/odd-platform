import React from 'react';
import { Box, Typography } from '@mui/material';
import { Link, useHistory } from 'react-router-dom';
import { DataEntityRef } from 'generated-sources';
import {
  AppInput,
  EntityClassItem,
  SearchSuggestionsAutocomplete,
} from 'components/shared';
import { useDebouncedCallback } from 'use-debounce';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { createDataEntitiesSearch, fetchSearchSuggestions } from 'redux/thunks';
import { ClearIcon, SearchIcon } from 'components/shared/Icons';
import { useAppPaths } from 'lib/hooks';
import {
  getSearchQuery,
  getSearchSuggestions,
  getSearchSuggestionsFetchingStatuses,
} from 'redux/selectors';
import * as S from './MainSearchStyles';

interface AppSearchProps {
  placeholder?: string;
}

const MainSearch: React.FC<AppSearchProps> = ({ placeholder }) => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const { searchPath, dataEntityDetailsPath } = useAppPaths();

  const query = useAppSelector(getSearchQuery);
  const suggestions = useAppSelector(getSearchSuggestions);
  const { isLoading: isSuggestionsLoading } = useAppSelector(
    getSearchSuggestionsFetchingStatuses
  );

  const [searchText, setSearchText] = React.useState<string>('');
  const [options, setOptions] = React.useState<Partial<DataEntityRef>[]>([]);
  const [autocompleteOpen, setAutocompleteOpen] = React.useState<boolean>(false);

  const createSearch = () => {
    const searchQuery = {
      query: searchText,
      pageSize: 30,
      filters: {},
    };
    dispatch(createDataEntitiesSearch({ searchFormData: searchQuery }))
      .unwrap()
      .then(({ searchId }) => {
        const searchLink = searchPath(searchId);
        history.replace(searchLink);
      });
    history.push(searchPath());
  };

  const handleInputChange = (_: React.ChangeEvent<unknown>, inputVal: string) => {
    setSearchText(inputVal);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      createSearch();
    }
  };

  const getSuggestions = React.useCallback(
    useDebouncedCallback(() => {
      dispatch(fetchSearchSuggestions({ query: searchText }));
    }, 500),
    [searchText, setOptions, fetchSearchSuggestions]
  );

  React.useEffect(() => {
    setSearchText(query || '');
  }, [query]);

  React.useEffect(() => {
    setOptions(suggestions);
  }, [suggestions]);

  React.useEffect(() => {
    if (!searchText) {
      setAutocompleteOpen(false);
      return;
    }
    if (autocompleteOpen) getSuggestions();
  }, [autocompleteOpen, searchText, getSuggestions]);

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
        <Link to={typedOption.id ? dataEntityDetailsPath(typedOption.id) : '#'}>
          <Box display='flex'>
            <Typography variant='body1' sx={{ mr: 1 }}>
              {typedOption.internalName || typedOption.externalName}
            </Typography>
            {typedOption.entityClasses?.map(entityClass => (
              <EntityClassItem
                sx={{ mr: 0.5 }}
                key={entityClass.id}
                entityClassName={entityClass.name}
              />
            ))}
          </Box>
        </Link>
      </li>
    );
  };

  return (
    <S.Container>
      <SearchSuggestionsAutocomplete
        inputParams={{
          placeholder:
            placeholder ||
            'Search data tables, feature groups, jobs and ML models via keywords',
        }}
      />
      {/* <S.SearchAutocomplete */}
      {/*  fullWidth */}
      {/*  value={{ externalName: searchText }} */}
      {/*  id='data-entity-search' */}
      {/*  open={autocompleteOpen} */}
      {/*  onOpen={() => { */}
      {/*    if (searchText) setAutocompleteOpen(true); */}
      {/*  }} */}
      {/*  onClose={() => { */}
      {/*    setAutocompleteOpen(false); */}
      {/*  }} */}
      {/*  onInputChange={handleInputChange} */}
      {/*  getOptionLabel={getOptionLabel} */}
      {/*  options={options} */}
      {/*  loading={isSuggestionsLoading} */}
      {/*  freeSolo */}
      {/*  filterOptions={option => option} */}
      {/*  clearIcon={<ClearIcon />} */}
      {/*  renderInput={params => ( */}
      {/*    <AppInput */}
      {/*      {...params} */}
      {/*      ref={params.InputProps.ref} */}
      {/*      size='large' */}
      {/*      placeholder={ */}
      {/*        placeholder || */}
      {/*        'Search data tables, feature groups, jobs and ML models via keywords' */}
      {/*      } */}
      {/*      onKeyDown={handleKeyDown} */}
      {/*      customStartAdornment={{ */}
      {/*        variant: 'search', */}
      {/*        showAdornment: true, */}
      {/*        onCLick: createSearch, */}
      {/*        icon: <SearchIcon />, */}
      {/*      }} */}
      {/*      customEndAdornment={{ */}
      {/*        variant: 'loader', */}
      {/*        showAdornment: isSuggestionsLoading, */}
      {/*        position: { mr: 4 }, */}
      {/*      }} */}
      {/*    /> */}
      {/*  )} */}
      {/*  renderOption={renderOption} */}
      {/* /> */}
    </S.Container>
  );
};

export default MainSearch;
