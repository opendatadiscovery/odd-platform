import { useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { URLSearchParams } from 'routes';
import type { QueryExampleSearchFacetsData } from 'generated-sources';
import {
  useCreateQueryExampleSearchId,
  useGetQueryExampleSearchFacets,
  useUpdateQueryExampleSearchFacets,
} from './api/dataModelling/searchQueryExamples';

export default function useCreateQueryExampleSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchId = useMemo(
    () => searchParams.get(URLSearchParams.QUERY_SEARCH_ID) ?? '',
    [searchParams]
  );

  const { mutateAsync: createFacets, isPending } = useCreateQueryExampleSearchId();
  const { mutateAsync: updateFacets } = useUpdateQueryExampleSearchFacets();
  const [facets, setFacets] = useState<QueryExampleSearchFacetsData>();
  const { data, isLoading: isFacetsLoading } = useGetQueryExampleSearchFacets({
    searchId,
    enabled: !!searchId,
  });

  useEffect(() => {
    if (searchId) return;

    createFacets('').then(({ searchId: sid, query, total }) => {
      setSearchParams({ [URLSearchParams.QUERY_SEARCH_ID]: sid });
      setFacets({ searchId: sid, query, total });
    });
  }, [searchId]);

  useEffect(() => {
    if (!data || facets) return;

    setFacets(data);
  }, [facets, data]);

  const isLoading = useMemo(
    () => isFacetsLoading || isPending,
    [isFacetsLoading, isPending]
  );

  return { facets, searchId, isLoading, updateFacets };
}
