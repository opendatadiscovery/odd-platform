import React from 'react';
import { TextField, InputAdornment, IconButton } from '@material-ui/core';
import cx from 'classnames';
import SearchIcon from '@material-ui/icons/Search';
import {
  SearchApiSearchRequest,
  SearchFacetsData,
} from 'generated-sources';
import { useHistory } from 'react-router-dom';
import { searchPath } from 'lib/paths';
import { StylesType } from 'components/shared/MainSearch/MainSearchStyles';

interface AppSearchProps extends StylesType {
  className?: string;
  query?: string;
  placeholder?: string;
  createDataEntitiesSearch: (
    params: SearchApiSearchRequest
  ) => Promise<SearchFacetsData>;
}

const MainSearch: React.FC<AppSearchProps> = ({
  classes,
  className,
  placeholder,
  query,
  createDataEntitiesSearch,
}) => {
  const [searchText, setSearchText] = React.useState<string | undefined>(
    query
  );

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
        history.push(searchLink);
      }
    );
    history.push(searchPath());
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      createSearch();
    }
  };

  React.useEffect(() => {
    setSearchText(query);
  }, [query]);

  return (
    <div className={cx(classes.searchContainer, className)}>
      <div className={classes.search}>
        <TextField
          placeholder={
            placeholder ||
            'Search data tables, feature groups, jobs and ML models via keywords'
          }
          className={classes.root}
          InputProps={{
            'aria-label': 'search',
            disableUnderline: true,
            className: classes.inputInput,
            startAdornment: (
              <InputAdornment position="end">
                <IconButton disableRipple onClick={createSearch}>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          value={searchText}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
};

export default MainSearch;
