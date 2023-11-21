import { useSearchParams } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import { URLSearchParams } from 'routes/dataModellingRoutes';
import {
  useCreateQueryExampleSearchId,
  useGetQueryExampleSearchFacets,
} from './api/dataModelling/searchQueryExamples';

export default function useCreateQueryExampleSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchId = searchParams.get(URLSearchParams.QUERY_SEARCH_ID);
  const { data: facetsData, isFetching } = useGetQueryExampleSearchFacets({
    enabled: !!searchId,
    searchId: searchId ?? '',
  });

  const { data: newFacetsData, isFetching: isCreating } = useCreateQueryExampleSearchId({
    enabled: !searchId && !facetsData,
  });

  const facets = useMemo(() => facetsData ?? newFacetsData, [facetsData, newFacetsData]);

  useEffect(() => {
    if (searchId || !facets?.searchId) return;

    setSearchParams({ [URLSearchParams.QUERY_SEARCH_ID]: facets.searchId });
  }, [searchId, facets?.searchId, setSearchParams]);

  return { facets, searchId, isFetching: isFetching || isCreating };
}
