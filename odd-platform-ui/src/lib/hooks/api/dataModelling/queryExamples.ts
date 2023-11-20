import { useQuery } from '@tanstack/react-query';
import type { QueryExampleApiGetQueryExampleDetailsRequest } from 'generated-sources';
import { queryExampleApi } from 'lib/api';

export function useGetQueryExampleDetails({
  exampleId,
}: QueryExampleApiGetQueryExampleDetailsRequest) {
  return useQuery({
    queryKey: ['getQueryExampleDetails', exampleId],
    queryFn: async () => queryExampleApi.getQueryExampleDetails({ exampleId }),
  });
}
