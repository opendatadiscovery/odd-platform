import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { termApi } from 'lib/api';
import type {
  TermApiGetTermByNamespaceAndNameRequest,
  TermApiGetTermLinkedColumnsRequest,
  TermApiCreateQueryExampleToTermRelationshipRequest,
  TermApiDeleteQueryExampleToTermRelationshipRequest,
} from 'generated-sources';
import { showSuccessToast, type AppError } from 'lib/errorHandling';

export function useGetTermByNamespaceAndName() {
  const queryClient = useQueryClient();

  return async ({ namespaceName, termName }: TermApiGetTermByNamespaceAndNameRequest) => {
    try {
      return await queryClient.fetchQuery({
        queryKey: ['terms', namespaceName, termName],
        queryFn: () => termApi.getTermByNamespaceAndName({ namespaceName, termName }),
      });
    } catch (error) {
      return error as AppError;
    }
  };
}

export function useGetTermLinkedColumns(params: TermApiGetTermLinkedColumnsRequest) {
  return useQuery({
    queryKey: ['termLinkedColumns', params.termId],
    queryFn: () => termApi.getTermLinkedColumns(params),
    enabled: false,
    initialData: { pageInfo: { total: 0, hasNext: false }, items: [] },
  });
}

export function useAssignTermQueryExample(termId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['assignTermQueryExample', termId],
    mutationFn: async ({
      queryExampleTermFormData,
    }: TermApiCreateQueryExampleToTermRelationshipRequest) =>
      termApi.createQueryExampleToTermRelationship({
        queryExampleTermFormData,
        termId,
      }),
    onSuccess: async () => {
      showSuccessToast({ message: 'Query Example successfully assigned!' });
      await queryClient.invalidateQueries({
        queryKey: ['getQueryExamplesByTermId'],
      });
    },
  });
}

export function useUnassignTermQueryExample(termId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['unassignTermQueryExample'],
    mutationFn: async ({
      exampleId,
    }: TermApiDeleteQueryExampleToTermRelationshipRequest) =>
      termApi.deleteQueryExampleToTermRelationship({
        termId,
        exampleId,
      }),
    onSuccess: async () => {
      showSuccessToast({ message: 'Query Example successfully unassigned!' });
      await queryClient.invalidateQueries({
        queryKey: ['getQueryExamplesByTermId'],
      });
    },
  });
}
