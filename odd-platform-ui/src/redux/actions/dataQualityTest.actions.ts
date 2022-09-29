import { createActionType } from 'redux/lib/helpers';

export const dataQualityTestTypePrefix = 'dataQualityTest';

export const fetchDataSetQualityTestReportActionType = createActionType(
  dataQualityTestTypePrefix,
  'fetchDataSetQualityTestReport'
);

export const fetchDataSetQualitySLAReportActionType = createActionType(
  dataQualityTestTypePrefix,
  'fetchDataSetQualitySLAReport'
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
