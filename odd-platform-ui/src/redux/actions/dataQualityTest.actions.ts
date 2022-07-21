import { createActionType } from 'lib/redux/helpers';

export const dataQualityTestTypePrefix = 'dataQualityTest';

export const fetchDataSetQualityTestReportActionType = createActionType(
  dataQualityTestTypePrefix,
  'fetchDataSetQualityTestReport'
);

export const fetchDataSetQualityTestListActionType = createActionType(
  dataQualityTestTypePrefix,
  'fetchDataSetQualityTestList'
);

const dataQATestActionTypePrefix = 'dataQATest';

export const setDataQATestSeverityActionType = createActionType(
  dataQATestActionTypePrefix,
  'setDataQATestSeverity'
);
