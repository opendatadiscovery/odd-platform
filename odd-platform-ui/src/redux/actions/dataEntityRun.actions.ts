import { createActionType } from 'lib/redux/helpers';

export const dataEntityRunTypePrefix = 'dataEntityRun';

export const fetchDataEntityRunsActionType = createActionType(
  dataEntityRunTypePrefix,
  'fetchDataSetQualityTestRuns'
);
