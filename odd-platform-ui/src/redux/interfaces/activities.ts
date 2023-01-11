import type {
  Activity as GeneratedActivity,
  ActivityApiGetActivityRequest,
} from 'generated-sources';
import type { SerializeDateToNumber } from 'redux/interfaces';

export type Activity = SerializeDateToNumber<GeneratedActivity>;

export interface ActivityQueryParams
  extends Omit<
    ActivityApiGetActivityRequest,
    'beginDate' | 'endDate' | 'lastEventDateTime'
  > {
  beginDate: number;
  endDate: number;
  lastEventDateTime?: number;
}

export type ActivityQueryName = keyof ActivityQueryParams;
