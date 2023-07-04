import { useQuery } from '@tanstack/react-query';
import { termApi } from 'lib/api';
import type { TermApiGetTermByNamespaceAndNameRequest } from 'generated-sources';

export function useGetTermByNamespaceAndName({
  namespaceName,
  termName,
}: TermApiGetTermByNamespaceAndNameRequest) {
  return useQuery(['term', namespaceName, termName], () => {
    const params = { namespaceName, termName };
    return termApi.getTermByNamespaceAndName(params);
  });
}
