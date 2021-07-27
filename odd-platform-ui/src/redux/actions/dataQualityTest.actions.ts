import { createAsyncAction } from 'typesafe-actions';
import { DataEntityList, DataSetTestReport } from 'generated-sources';
import { PartialDataEntityUpdateParams } from 'redux/interfaces';

export const fetchDataSetQualityTestReportAction = createAsyncAction(
  'GET_DATA_SET_QUALITY_TEST_REPORT__REQUEST',
  'GET_DATA_SET_QUALITY_TEST_REPORT__SUCCESS',
  'GET_DATA_SET_QUALITY_TEST_REPORT__FAILURE'
)<
  undefined,
  PartialDataEntityUpdateParams<DataSetTestReport>,
  undefined
>();

export const fetchDataSetQualityTestListAction = createAsyncAction(
  'GET_DATA_SET_QUALITY_TEST_LIST_REPORT__REQUEST',
  'GET_DATA_SET_QUALITY_TEST_LIST_REPORT__SUCCESS',
  'GET_DATA_SET_QUALITY_TEST_LIST_REPORT__FAILURE'
)<undefined, PartialDataEntityUpdateParams<DataEntityList>, undefined>();
