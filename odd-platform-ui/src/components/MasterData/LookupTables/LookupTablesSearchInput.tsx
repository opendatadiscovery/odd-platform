import { Input } from 'components/shared/elements';
import React, { useCallback, useState } from 'react';

const LookupTablesSearchInput = () => {
  const [query, setQuery] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setQuery(e.target.value);

  const handleSearch = useCallback(() => {
    console.log('lookup tables search input');
  }, [query]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') handleSearch();
  };

  return (
    <Input
      variant='search-lg'
      id='lookup-tables-search'
      placeholder='Search lookup tables...'
      maxWidth={640}
      onKeyDown={handleKeyDown}
      onChange={handleInputChange}
      value={query}
    />
  );
};

export default LookupTablesSearchInput;
