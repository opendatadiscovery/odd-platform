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
  TermApiGetTermLinkedColumnsRequest,
  TermApiGetTermLinkedTermsRequest,
  TermApiCreateQueryExampleToTermRelationshipRequest,
  TermApiDeleteQueryExampleToTermRelationshipRequest,
  TermApiDeleteLinkedTermFromTermRequest,
  TermApiAddLinkedTermToTermRequest,
} from 'generated-sources';
import { showSuccessToast, type AppError } from 'lib/errorHandling';
import { useAppDispatch } from 'redux/lib/hooks';
import { fetchTermDetails } from 'redux/thunks';

/**
 * One term's details (`GET /api/terms/{term_id}`), keyed per term — the read behind the search row's (i) details
 * preview (#1899). The term detail PAGE keeps reading redux (`fetchTermDetails`): its loading status is per action,
 * not per row, and its slice splits ownership out — the wrong shape for a keyed hover cache. Mounted only while the
 * card is open, so it needs no `enabled` gate.
 */
export function useTermDetails({ termId }: { termId: number }) {
  return useQuery({
    queryKey: ['termDetails', termId],
    queryFn: () => termApi.getTermDetails({ termId }),
  });
}

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

export function useGetTermLinkedColumns(
  params: Omit<TermApiGetTermLinkedColumnsRequest, 'page'>
) {
  return useInfiniteQuery({
    queryKey: ['termLinkedColumns', params.termId, params.size, params.query],
    queryFn: ({ pageParam }) =>
      termApi.getTermLinkedColumns({
        page: pageParam,
        size: params.size,
        termId: params.termId,
        query: params.query,
      }),
    initialPageParam: 1,
    // The backend now returns an honest pageInfo (real total + hasNext) for this endpoint,
    // so paging is driven by it directly (no client-side full-page heuristic needed).
    getNextPageParam: (lastPage, allPages) =>
      lastPage.pageInfo.hasNext ? allPages.length + 1 : undefined,
  });
}

interface ResponseWithPageInfo {
  items: unknown[];
  pageInfo: PageInfo & { nextPage?: number };
}

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
  const dispatch = useAppDispatch();
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
      // The Overview linked-terms panel reads term details from redux, so refresh that store.
      await dispatch(fetchTermDetails({ termId }));
    },
  });
}

export function useDeleteLinkedTermToTerm({ termId }: { termId: number }) {
  const dispatch = useAppDispatch();
  return useMutation({
    mutationFn: async (params: TermApiDeleteLinkedTermFromTermRequest) => {
      await termApi.deleteLinkedTermFromTerm(params);
      return params.linkedTermId;
    },
    onSuccess: async () => {
      showSuccessToast({ message: 'Term successfully deleted!' });
      await dispatch(fetchTermDetails({ termId }));
    },
  });
}
