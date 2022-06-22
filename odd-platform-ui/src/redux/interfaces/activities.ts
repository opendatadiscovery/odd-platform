import { ActivityList } from 'generated-sources';

export type ActivitiesTotals = Omit<ActivityList, 'items' | 'pageInfo'>;
