export interface LoaderState {
  statuses: {
    [key: string]: FetchStatus;
  };
  errors: {
    [key: string]: ErrorState | undefined;
  };
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

export type AsyncRequestStatus =
  | 'initial'
  | 'pending'
  | 'fulfilled'
  | 'rejected';

export interface LoaderSliceState {
  statuses: { [key: string]: AsyncRequestStatus };
  errors: { [key: string]: ErrorState | undefined };
}
