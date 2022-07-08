import { ActivityEventType, ActivityType } from 'generated-sources';

export interface ActivitySingleFilterOption {
  id: number | string;
  name: string;
}

export interface ActivityMultipleFilterOption {
  id: number;
  name: string;
  important?: boolean;
}

export interface ActivityQueryParams {
  beginDate: string;
  endDate: string;
  size: number;
  datasourceId?: number;
  namespaceId?: number;
  tagIds?: Array<number>;
  ownerIds?: Array<number>;
  userIds?: Array<number>;
  type?: ActivityType;
  eventType?: ActivityEventType;
  lastEventId?: number;
  lastEventDateTime?: string;
}

export interface ActivityCountParamsRequest {
  beginDate: string;
  endDate: string;
  datasourceId?: number;
  namespaceId?: number;
  tagIds?: Array<number>;
  ownerIds?: Array<number>;
  userIds?: Array<number>;
  eventType?: ActivityEventType;
}

export interface ActivityListParamsRequest {
  beginDate: string;
  endDate: string;
  size: number;
  datasourceId?: number;
  namespaceId?: number;
  tagIds?: Array<number>;
  ownerIds?: Array<number>;
  userIds?: Array<number>;
  type?: ActivityType;
  eventType?: ActivityEventType;
  lastEventId?: number;
  lastEventDateTime?: string;
}

export type ActivityQueryNames = keyof ActivityQueryParams;

export type ActivitySingleQueryName = keyof Pick<
  ActivityQueryParams,
  | 'beginDate'
  | 'endDate'
  | 'size'
  | 'datasourceId'
  | 'namespaceId'
  | 'type'
  | 'eventType'
  | 'lastEventDateTime'
>;

export type ActivitySingleQueryData =
  | Date
  | number
  | ActivityType
  | ActivityEventType
  | null;

export type ActivityMultipleQueryName = keyof Pick<
  ActivityQueryParams,
  'tagIds' | 'ownerIds' | 'userIds'
>;

export type ActivityMultipleQueryData = Array<number>;

export type ActivityDateParams = keyof Pick<
  ActivityQueryParams,
  'beginDate' | 'endDate' | 'lastEventDateTime'
>;

export interface ActivityPayload<PayloadType, PayloadValue> {
  payload: { type: PayloadType; value: PayloadValue };
}
