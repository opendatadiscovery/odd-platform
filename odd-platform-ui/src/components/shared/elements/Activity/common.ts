import { addDays, endOfDay, startOfDay } from 'date-fns';
import type { Activity, RequiredField, SerializeDateToNumber } from 'redux/interfaces';
import type { ActivityApiGetActivityRequest } from 'generated-sources';
import { ActivityType } from 'generated-sources';
import { activityListSize } from 'redux/thunks';

export type ActivityQuery = RequiredField<
  SerializeDateToNumber<ActivityApiGetActivityRequest>,
  'type'
>;

export type ActivitySingleFilterNames = keyof Pick<
  ActivityQuery,
  'datasourceId' | 'namespaceId' | 'eventType'
>;
export type ActivityMultipleFilterNames = keyof Pick<
  ActivityQuery,
  'tagIds' | 'ownerIds' | 'userIds' | 'usernames'
>;

export interface ActivityFilterOption {
  // tagIds/ownerIds carry numeric ids; the usernames filter (#1657) carries the
  // recorded actor username (a string), so an option id spans both.
  id: number | string;
  name: string;
  important?: boolean;
}

export interface ActivityItemProps {
  activity: Activity;
  hideAllDetails: boolean;
  dataQA?: string;
}

const beginDate = startOfDay(addDays(new Date(), -5)).getTime();
const endDate = endOfDay(addDays(new Date(), 1)).getTime();

export const defaultActivityQuery: ActivityQuery = {
  beginDate,
  endDate,
  size: activityListSize,
  type: ActivityType.ALL,
};
