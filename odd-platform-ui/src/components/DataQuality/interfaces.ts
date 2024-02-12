import type { UseQueryResult } from '@tanstack/react-query';

export type FilterOption = {
  id: number;
  name: string;
};
export type Response = {
  items: FilterOption[];
};
export type HookResult = UseQueryResult<Response>;
export type Hook = ({
  page,
  size,
  query,
}: {
  page: number;
  size: number;
  query: string;
}) => UseQueryResult<Response>;
