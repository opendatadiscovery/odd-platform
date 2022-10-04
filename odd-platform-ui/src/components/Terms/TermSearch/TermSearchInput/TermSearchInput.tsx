import React from 'react';
import { AppInput } from 'components/shared';
import { ClearIcon, SearchIcon } from 'components/shared/Icons';
import { getTermSearchId, getTermSearchQuery } from 'redux/selectors';
import { updateTermSearch } from 'redux/thunks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { updateTermSearchQuery } from 'redux/slices/termSearch.slice';
import { Box } from '@mui/material';

const TermSearchInput: React.FC = () => {
  const dispatch = useAppDispatch();

  const searchId = useAppSelector(getTermSearchId);
  const query = useAppSelector(getTermSearchQuery);

  const [searchText, setSearchText] = React.useState(query);

  React.useEffect(
    () => () => {
      dispatch(updateTermSearchQuery(''));
    },
    [dispatch, updateTermSearchQuery]
  );

  React.useEffect(() => setSearchText(query), [query]);

  const updateSearch = () => {
    const termSearchFormData = { query: searchText, pageSize: 30, filters: {} };
    dispatch(updateTermSearch({ searchId, termSearchFormData }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchText(e.target.value);

  const clearSearchField = () => setSearchText('');

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') updateSearch();
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '640px' }}>
      <AppInput
        size='large'
        placeholder='Search'
        onKeyDown={handleKeyDown}
        onChange={handleInputChange}
        value={searchText}
        customStartAdornment={{
          variant: 'search',
          showAdornment: true,
          onCLick: updateSearch,
          icon: <SearchIcon />,
        }}
        customEndAdornment={{
          variant: 'clear',
          showAdornment: !!searchText,
          onCLick: clearSearchField,
          icon: <ClearIcon />,
        }}
      />
    </Box>
  );
};

export default TermSearchInput;
