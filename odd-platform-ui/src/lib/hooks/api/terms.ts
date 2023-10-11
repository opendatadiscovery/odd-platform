import { useQueryClient } from '@tanstack/react-query';
import { termApi } from 'lib/api';
import type { TermApiGetTermByNamespaceAndNameRequest } from 'generated-sources';
import type { AppError } from 'lib/errorHandling';

export function useGetTermByNamespaceAndName() {
  const queryClient = useQueryClient();

  return async ({ namespaceName, termName }: TermApiGetTermByNamespaceAndNameRequest) => {
    try {
      return await queryClient.fetchQuery(['terms', namespaceName, termName], () =>
        termApi.getTermByNamespaceAndName({ namespaceName, termName })
      );
    } catch (error) {
      return error as AppError;
    }
  };
}
