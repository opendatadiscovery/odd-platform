import React from 'react';
import cx from 'classnames';
import {
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  CircularProgress,
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { Autocomplete } from '@material-ui/lab';
import { Link, useHistory } from 'react-router-dom';
import {
  SearchApiSearchRequest,
  SearchFacetsData,
  DataEntityRef,
  SearchApiGetSearchSuggestionsRequest,
} from 'generated-sources';
import { searchPath, dataEntityDetailsPath } from 'lib/paths';
import { StylesType } from 'components/shared/MainSearch/MainSearchStyles';
import EntityTypeItem from 'components/shared/EntityTypeItem/EntityTypeItem';
import { useDebouncedCallback } from 'use-debounce/lib';

interface AppSearchProps extends StylesType {
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
  classes,
  className,
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

  return (
    <div className={cx(classes.searchContainer, className)}>
      <div className={classes.search}>
        <Autocomplete
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
          getOptionLabel={option =>
            option.internalName || option.externalName || ''
          }
          options={options}
          loading={loadingSuggestions}
          className={classes.autocomplete}
          classes={{
            endAdornment: classes.clearIconContainer,
          }}
          freeSolo
          renderInput={params => (
            <TextField
              {...params}
              placeholder={
                placeholder ||
                'Search data tables, feature groups, jobs and ML models via keywords'
              }
              InputProps={{
                ...params.InputProps,
                disableUnderline: true,
                classes: {
                  root: classes.inputInput,
                },
                startAdornment: (
                  <InputAdornment position="end">
                    <IconButton disableRipple onClick={createSearch}>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
                endAdornment: (
                  <>
                    {loadingSuggestions ? (
                      <CircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
              onKeyDown={handleKeyDown}
            />
          )}
          renderOption={option => (
            <Link
              to={option.id ? dataEntityDetailsPath(option.id) : '#'}
              className={classes.suggestionItem}
            >
              <Typography variant="body2">
                {option.internalName || option.externalName}
              </Typography>
              <div className={classes.suggestionItemTypes}>
                {option.types?.map(type => (
                  <EntityTypeItem key={type.id} typeName={type.name} />
                ))}
              </div>
            </Link>
          )}
        />
      </div>
    </div>
  );
};

export default MainSearch;
