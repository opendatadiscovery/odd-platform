import type { ErrorResponse } from 'generated-sources';

export interface ErrorState {
  status: number;
  statusText: string;
  url: string;
  message: ErrorResponse['message'];
}

export type FetchStatus = 'notFetched' | 'fetching' | 'fetched' | 'errorFetching';

export type AsyncRequestStatus = 'initial' | 'pending' | 'fulfilled' | 'rejected';

export interface LoaderSliceState {
  statuses: { [key: string]: AsyncRequestStatus };
  errors: { [key: string]: ErrorState | undefined };
}
