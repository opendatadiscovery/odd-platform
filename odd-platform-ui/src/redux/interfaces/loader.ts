export interface LoaderState {
  statuses: {
    [key: string]: FetchStatus;
  },
  errors: {
    [key: string]: ErrorState | undefined;
  }
}

export interface ErrorState {
  statusCode?: string;
  statusText?: string;
}

export type FetchStatus =
  | 'notFetched'
  | 'fetching'
  | 'fetched'
  | 'errorFetching';
