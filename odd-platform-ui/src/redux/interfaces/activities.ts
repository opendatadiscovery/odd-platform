import {
  ActivityApiGetActivityRequest,
  ActivityEventType,
  ActivityList,
  ActivityType,
} from 'generated-sources';

export type ActivitiesTotals = Omit<ActivityList, 'items' | 'pageInfo'>;

export interface ActivitySingleFilterOption {
  id: number | string;
  name: string;
}

export interface ActivityMultipleFilterOption {
  id: number;
  name: string;
  important?: boolean;
}

export interface ActivityFilters {
  beginDate?: Date;
  endDate?: Date;
  size?: number;
  datasourceId?: number | string;
  namespaceId?: number | string;
  tags?: Array<ActivityMultipleFilterOption>;
  owners?: Array<ActivityMultipleFilterOption>;
  users?: Array<ActivityMultipleFilterOption>;
  type?: ActivityType;
  dataEntityId?: number;
  eventType?: ActivityEventType;
  lastEventDateTime?: Date;
}

export type ActivityQueryParams = ActivityApiGetActivityRequest;
export type ActivityQueryNames = keyof ActivityQueryParams;

export type ActivitySingleFilterName = keyof Pick<
  ActivityQueryParams,
  'datasourceId' | 'namespaceId' | 'eventType' | 'type' | 'size'
>;

export type ActivitySingleQueryName = keyof Pick<
  ActivityQueryParams,
  | 'beginDate'
  | 'endDate'
  | 'size'
  | 'datasourceId'
  | 'namespaceId'
  | 'type'
  | 'dataEntityId'
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

export interface ActivitySingleFilterPayload {
  payload: {
    filterName: ActivitySingleFilterName;
    data: ActivityFilters[ActivitySingleFilterName];
  };
  type: string;
}

export type ActivityMultipleFilterName = keyof Pick<
  ActivityFilters,
  'tags' | 'owners' | 'users'
>;

export interface AddActivityMultipleFilterPayload {
  payload: {
    filterName: ActivityMultipleFilterName;
    data: ActivityFilters[ActivityMultipleFilterName];
  };
  type: string;
}

export interface DeleteActivityMultipleFilterPayload {
  payload: {
    filterName: ActivityMultipleFilterName;
    data: ActivityMultipleFilterOption;
  };
  type: string;
}
