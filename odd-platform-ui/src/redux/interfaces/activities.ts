import {
  Activity as GeneratedActivity,
  ActivityApiGetActivityCountsRequest,
  ActivityApiGetActivityRequest,
  ActivityEventType,
  ActivityType,
  DataEntityApiGetDataEntityActivityRequest,
} from 'generated-sources';

export interface Activity extends Omit<GeneratedActivity, 'createdAt'> {
  createdAt: number;
}

export interface ActivityPageInfo {
  hasNext: boolean;
  lastEventId?: number;
  lastEventDateTime?: number;
}

export interface ActivityListResponse {
  activities: Activity[];
  pageInfo: ActivityPageInfo;
}

export interface ActivityFilterOption {
  id: number;
  name: string;
  important?: boolean;
}

export interface ActivityQueryParams
  extends Omit<
    ActivityApiGetActivityRequest,
    'beginDate' | 'endDate' | 'lastEventDateTime'
  > {
  beginDate: number;
  endDate: number;
  lastEventDateTime?: number;
}

export interface DataEntityActivityQueryParams
  extends Omit<
    DataEntityApiGetDataEntityActivityRequest,
    'beginDate' | 'endDate' | 'lastEventDateTime'
  > {
  beginDate: number;
  endDate: number;
  lastEventDateTime?: number;
}

export interface ActivityCountParamsRequest
  extends Omit<
    ActivityApiGetActivityCountsRequest,
    'beginDate' | 'endDate'
  > {
  beginDate: number;
  endDate: number;
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
