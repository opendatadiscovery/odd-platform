import { useMutation, useQuery } from '@tanstack/react-query';
import type {
  QueryExampleApiGetQueryExampleDetailsRequest,
  QueryExampleApiGetQueryExampleByDatasetIdRequest,
  QueryExampleApiCreateQueryExamplesRequest,
  QueryExampleApiUpdateQueryExampleRequest,
} from 'generated-sources';
import { queryExampleApi } from 'lib/api';
import { showSuccessToast } from 'lib/errorHandling';

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

export function useCreateQueryExample() {
  return useMutation({
    mutationKey: ['createQueryExample'],
    mutationFn: async ({
      queryExampleFormData,
    }: QueryExampleApiCreateQueryExamplesRequest) =>
      queryExampleApi.createQueryExamples({ queryExampleFormData }),
    onSuccess: () => showSuccessToast({ message: 'Query Example successfully created!' }),
  });
}

export function useUpdateQueryExample() {
  return useMutation({
    mutationKey: ['updateQueryExample'],
    mutationFn: async ({
      queryExampleFormData,
      exampleId,
    }: QueryExampleApiUpdateQueryExampleRequest) =>
      queryExampleApi.updateQueryExample({ exampleId, queryExampleFormData }),
    onSuccess: () => showSuccessToast({ message: 'Query Example successfully updated!' }),
  });
}
