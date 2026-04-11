import { createActionType } from 'redux/lib/helpers';

export const dataEntityRunTypePrefix = 'dataEntityRun';

export const fetchDataEntityRunsActionType = createActionType(
  dataEntityRunTypePrefix,
  'fetchDataSetQualityTestRuns'
);
