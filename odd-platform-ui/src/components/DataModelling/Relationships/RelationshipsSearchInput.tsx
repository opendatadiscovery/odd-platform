import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchInput } from 'components/shared/elements';

const RelationshipsSearchInput = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSearch = (v?: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('q', v ?? '');
    setSearchParams(params);
  };

  return (
    <SearchInput
      id='relationships-search'
      placeholder='Search relationships'
      onSearch={handleSearch}
      value={searchParams.get('q') ?? ''}
    />
  );
};

export default RelationshipsSearchInput;
