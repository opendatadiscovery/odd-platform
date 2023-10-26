import { useQuery, useQueryClient } from '@tanstack/react-query';
import { termApi } from 'lib/api';
import type {
  TermApiGetTermByNamespaceAndNameRequest,
  TermApiGetTermLinkedColumnsRequest,
} from 'generated-sources';
import type { AppError } from 'lib/errorHandling';

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
