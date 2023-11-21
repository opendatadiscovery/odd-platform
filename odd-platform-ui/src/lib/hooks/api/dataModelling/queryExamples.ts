import { useQuery } from '@tanstack/react-query';
import type {
  QueryExampleApiGetQueryExampleDetailsRequest,
  QueryExampleApiGetQueryExampleByDatasetIdRequest,
} from 'generated-sources';
import { queryExampleApi } from 'lib/api';

export function useGetQueryExampleDetails({
  exampleId,
}: QueryExampleApiGetQueryExampleDetailsRequest) {
  return useQuery({
    queryKey: ['getQueryExampleDetails', exampleId],
    queryFn: async () => queryExampleApi.getQueryExampleDetails({ exampleId }),
  });
}

export function useGetQueryExamplesByDatasetId({
  dataEntityId,
}: QueryExampleApiGetQueryExampleByDatasetIdRequest) {
  return useQuery({
    queryKey: ['getQueryExamplesByDatasetId', dataEntityId],
    queryFn: async () => queryExampleApi.getQueryExampleByDatasetId({ dataEntityId }),
  });
}
