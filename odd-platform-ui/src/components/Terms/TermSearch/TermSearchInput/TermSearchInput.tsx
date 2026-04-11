import React from 'react';
import { Input } from 'components/shared/elements';
import { getTermSearchId, getTermSearchQuery } from 'redux/selectors';
import { updateTermSearch } from 'redux/thunks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { updateTermSearchQuery } from 'redux/slices/termSearch.slice';

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

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') updateSearch();
  };

  return (
    <Input
      variant='search-lg'
      placeholder='Search terms...'
      maxWidth={640}
      onKeyDown={handleKeyDown}
      onChange={handleInputChange}
      value={searchText}
      handleSearchClick={updateSearch}
    />
  );
};

export default TermSearchInput;
