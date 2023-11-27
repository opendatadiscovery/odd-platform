import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  QueryExampleApiGetQueryExampleDetailsRequest,
  QueryExampleApiGetQueryExampleByDatasetIdRequest,
  QueryExampleApiCreateQueryExamplesRequest,
  QueryExampleApiUpdateQueryExampleRequest,
  QueryExampleApiCreateQueryExampleToDatasetRelationshipRequest,
  QueryExampleApiDeleteQueryExampleToDatasetRelationshipRequest,
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['updateQueryExample'],
    mutationFn: async ({
      queryExampleFormData,
      exampleId,
    }: QueryExampleApiUpdateQueryExampleRequest) =>
      queryExampleApi.updateQueryExample({ exampleId, queryExampleFormData }),
    onSuccess: async qed => {
      showSuccessToast({ message: 'Query Example successfully updated!' });
      await queryClient.invalidateQueries({
        queryKey: ['getQueryExampleDetails', qed.id],
      });
    },
  });
}

export function useDeleteQueryExample() {
  return useMutation({
    mutationKey: ['deleteQueryExample'],
    mutationFn: async ({ exampleId }: { exampleId: number }) =>
      queryExampleApi.deleteQueryExample({ exampleId }),
    onSuccess: async () => {
      showSuccessToast({ message: 'Query Example successfully deleted!' });
    },
  });
}

export function useAssignEntityQueryExample() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['assignEntityQueryExample'],
    mutationFn: async ({
      exampleId,
      queryExampleDatasetFormData,
    }: QueryExampleApiCreateQueryExampleToDatasetRelationshipRequest) =>
      queryExampleApi.createQueryExampleToDatasetRelationship({
        exampleId,
        queryExampleDatasetFormData,
      }),
    onSuccess: async () => {
      showSuccessToast({ message: 'Query Example successfully assigned!' });
      await queryClient.invalidateQueries({
        queryKey: ['getQueryExamplesByDatasetId'],
      });
    },
  });
}

export function useUnassignEntityQueryExample() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['unassignEntityQueryExample'],
    mutationFn: async (
      params: QueryExampleApiDeleteQueryExampleToDatasetRelationshipRequest
    ) => queryExampleApi.deleteQueryExampleToDatasetRelationship(params),
    onSuccess: async () => {
      showSuccessToast({ message: 'Query Example successfully unassigned!' });
      await queryClient.invalidateQueries({
        queryKey: ['getQueryExamplesByDatasetId'],
      });
    },
  });
}
