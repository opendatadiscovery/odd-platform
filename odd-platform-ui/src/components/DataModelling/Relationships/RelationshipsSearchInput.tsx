import React, { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchInput } from 'components/shared/elements';

interface Props {
  value?: string;
}

const RelationshipsSearchInput = ({ value }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSearch = useCallback(
    (v?: string) => {
      searchParams.set('q', v ?? '');
      setSearchParams(searchParams);
    },
    [searchParams]
  );

  return (
    <SearchInput
      id='relationships-search'
      placeholder='Search relationships'
      onSearch={handleSearch}
      value={value}
    />
  );
};

export default RelationshipsSearchInput;
