import { useSearchParams } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import { useAppPaths } from './index';
import {
  useCreateQueryExampleSearchId,
  useGetQueryExampleSearchFacets,
} from './api/dataModelling/searchQueryExample';

export default function useCreateQueryExampleSearch() {
  const { DataModellingRoutes } = useAppPaths();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchId = searchParams.get(DataModellingRoutes.querySearchId);
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

    setSearchParams({ [DataModellingRoutes.querySearchId]: facets.searchId });
  }, [searchId, facets?.searchId, setSearchParams]);

  return { facets, searchId, isFetching: isFetching || isCreating };
}
