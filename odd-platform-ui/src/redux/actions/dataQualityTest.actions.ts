import { createAsyncAction } from 'typesafe-actions';
import { DataSetTestReport } from 'generated-sources';
import { PartialDataEntityUpdateParams } from '../interfaces/dataentities';

export const fetchDataSetQualityTestReportAction = createAsyncAction(
  'GET_DATA_SET_QUALITY_TEST_REPORT__REQUEST',
  'GET_DATA_SET_QUALITY_TEST_REPORT__SUCCESS',
  'GET_DATA_SET_QUALITY_TEST_REPORT__FAILURE'
)<
  undefined,
  PartialDataEntityUpdateParams<DataSetTestReport>,
  undefined
>();
