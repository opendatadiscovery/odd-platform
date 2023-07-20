import { useQueryClient } from '@tanstack/react-query';
import { termApi } from 'lib/api';
import type { TermApiGetTermByNamespaceAndNameRequest, TermRef } from 'generated-sources';
import type { AppError } from 'lib/errorHandling';

export function useGetTermByNamespaceAndName() {
  const queryClient = useQueryClient();

  return async ({
    namespaceName,
    termName,
  }: TermApiGetTermByNamespaceAndNameRequest): Promise<TermRef | AppError> => {
    try {
      const params = { namespaceName, termName };
      return await queryClient.fetchQuery(['term', namespaceName, termName], () =>
        termApi.getTermByNamespaceAndName(params)
      );
    } catch (error) {
      return error as AppError;
    }
  };
}
