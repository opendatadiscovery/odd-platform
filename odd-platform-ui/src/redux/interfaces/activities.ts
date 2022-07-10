import { ActivityEventType, ActivityType } from 'generated-sources';

export interface ActivityFilterOption {
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
  type: ActivityType;
  eventType?: ActivityEventType;
  lastEventId?: number;
  lastEventDateTime?: string;
}

export interface DataEntityActivityQueryParams {
  dataEntityId: number;
  beginDate: string;
  endDate: string;
  size: number;
  userIds?: Array<number>;
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

export type ActivityQueryName = keyof ActivityQueryParams;
export type ActivityQueryData =
  | number
  | ActivityType
  | ActivityEventType
  | null
  | string
  | Array<number>;

export interface ActivityPayload<PayloadName, PayloadData> {
  payload: { queryName: PayloadName; queryData: PayloadData };
}
