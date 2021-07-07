export interface LoaderState {
  [key: string]: FetchStatus;
}

export type FetchStatus =
  | 'notFetched'
  | 'fetching'
  | 'fetched'
  | 'errorFetching';
