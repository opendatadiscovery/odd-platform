import type { ErrorResponse } from 'generated-sources';

export interface ErrorState {
  status: number;
  statusText: string;
  url: string;
  message: ErrorResponse['message'];
}

export type AsyncRequestStatus = 'initial' | 'pending' | 'fulfilled' | 'rejected';

export interface LoaderSliceState {
  statuses: Record<string, AsyncRequestStatus>;
  errors: Record<string, ErrorState | undefined>;
}
