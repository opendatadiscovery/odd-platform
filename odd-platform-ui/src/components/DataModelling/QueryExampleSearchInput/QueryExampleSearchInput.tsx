import { Input } from 'components/shared/elements';
import React, { useCallback, useEffect, useState } from 'react';
import type { QueryExampleSearchFacetsData } from 'generated-sources';
import { useUpdateQueryExampleSearchFacets } from 'lib/hooks/api/dataModelling/searchQueryExample';

interface QueryExampleSearchInputProps {
  facets?: QueryExampleSearchFacetsData;
}

const QueryExampleSearchInput = ({ facets }: QueryExampleSearchInputProps) => {
  const [query, setQuery] = useState(facets?.query ?? '');
  const { mutate } = useUpdateQueryExampleSearchFacets();

  useEffect(() => {
    if (facets?.query) setQuery(facets.query);
  }, [facets]);

  const handleSearch = useCallback(() => {
    if (!facets?.searchId) return;

    mutate({
      searchId: facets.searchId,
      queryExampleSearchFormData: { ...facets, query },
    });
  }, [query, facets]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setQuery(e.target.value);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') handleSearch();
  };

  return (
    <Input
      variant='search-lg'
      id='query-example-search'
      placeholder='Search query examples...'
      maxWidth={640}
      onKeyDown={handleKeyDown}
      onChange={handleInputChange}
      value={query}
      handleSearchClick={handleSearch}
    />
  );
};

export default QueryExampleSearchInput;
