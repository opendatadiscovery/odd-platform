import type { PageInfo } from 'generated-sources';

type ResponseWithPageInfo = {
  items: Array<unknown>;
  pageInfo: PageInfo & { nextPage?: number };
};

export function addNextPage<R extends ResponseWithPageInfo>(
  response: R,
  pageParam: number,
  size: number
) {
  const totalPageCount = Math.ceil(response.pageInfo.total / size);
  const nextPage = pageParam < totalPageCount ? pageParam + 1 : undefined;

  return {
    ...response,
    pageInfo: { ...response.pageInfo, nextPage },
  };
}
