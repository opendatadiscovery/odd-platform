import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { termApi } from 'lib/api';
import type {
  PageInfo,
  TermApiGetTermByNamespaceAndNameRequest,
  TermApiGetTermDetailsRequest,
  TermApiGetTermLinkedColumnsRequest,
  TermApiGetTermLinkedTermsRequest,
  TermApiCreateQueryExampleToTermRelationshipRequest,
  TermApiDeleteQueryExampleToTermRelationshipRequest,
  TermApiDeleteLinkedTermFromTermRequest,
  TermApiAddLinkedTermToTermRequest,
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

export function useGetTermByID(params: TermApiGetTermDetailsRequest) {
  return useQuery({
    queryKey: ['term', params.termId],
    queryFn: () => termApi.getTermDetails(params),
  });
}

type ResponseWithPageInfo = {
  items: Array<unknown>;
  pageInfo: PageInfo & { nextPage?: number };
};

function addNextPage<R extends ResponseWithPageInfo>(
  response: R,
  pageParam: number,
  size: number
) {
  const hasNext = size === response.pageInfo.total;
  const nextPage = hasNext ? pageParam + 1 : undefined;

  return {
    ...response,
    pageInfo: {
      ...response.pageInfo,
      nextPage,
      hasNext,
    },
  };
}

export function useGetTermLinkedTerms(
  params: Omit<TermApiGetTermLinkedTermsRequest, 'page'>
) {
  return useInfiniteQuery({
    queryKey: ['termLinkedTerms', params.termId, params.size, params.query],
    queryFn: async ({ pageParam }) => {
      const response = await termApi.getTermLinkedTerms({
        page: pageParam,
        size: params.size,
        termId: params.termId,
        query: params.query,
      });
      // this is retarded, but we need to add the next page to the response manually
      return addNextPage(response, pageParam, params.size);
    },
    initialPageParam: 1,
    getNextPageParam: lastPage => lastPage.pageInfo.nextPage,
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

export function useUnassignTermQueryExample() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['unassignTermQueryExample'],
    mutationFn: async ({
      exampleId,
      termId,
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

export function useAddLinkedTermToTerm({ termId }: { termId: number }) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      termId: termIdParam,
      linkedTermFormData,
    }: TermApiAddLinkedTermToTermRequest) =>
      termApi.addLinkedTermToTerm({
        termId: termIdParam, // target
        linkedTermFormData, // assigned term
      }),
    onSuccess: async () => {
      showSuccessToast({ message: 'Term successfully added!' });
      await queryClient.invalidateQueries({
        queryKey: ['term', termId],
      });
    },
  });
}

export function useDeleteLinkedTermToTerm({ termId }: { termId: number }) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: TermApiDeleteLinkedTermFromTermRequest) => {
      await termApi.deleteLinkedTermFromTerm(params);
      return params.linkedTermId;
    },
    onSuccess: async () => {
      showSuccessToast({ message: 'Term successfully deleted!' });
      await queryClient.invalidateQueries({
        queryKey: ['term', termId],
      });
    },
  });
}
