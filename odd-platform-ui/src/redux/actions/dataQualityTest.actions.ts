import { createAsyncAction } from 'typesafe-actions';
import {
  DataEntityList,
  DataQualityTestRunList,
  DataSetTestReport,
} from 'generated-sources';
import {
  PaginatedResponse,
  PartialEntityUpdateParams,
} from 'redux/interfaces';

export const fetchDataSetQualityTestReportAction = createAsyncAction(
  'GET_DATA_SET_QUALITY_TEST_REPORT__REQUEST',
  'GET_DATA_SET_QUALITY_TEST_REPORT__SUCCESS',
  'GET_DATA_SET_QUALITY_TEST_REPORT__FAILURE'
)<undefined, PartialEntityUpdateParams<DataSetTestReport>, undefined>();

export const fetchDataSetQualityTestListAction = createAsyncAction(
  'GET_DATA_SET_QUALITY_TEST_LIST_REPORT__REQUEST',
  'GET_DATA_SET_QUALITY_TEST_LIST_REPORT__SUCCESS',
  'GET_DATA_SET_QUALITY_TEST_LIST_REPORT__FAILURE'
)<undefined, PartialEntityUpdateParams<DataEntityList>, undefined>();

export const fetchDataSetQualityTestRunsAction = createAsyncAction(
  'GET_DATA_SET_QUALITY_TEST_RUNS_REPORT__REQUEST',
  'GET_DATA_SET_QUALITY_TEST_RUNS_REPORT__SUCCESS',
  'GET_DATA_SET_QUALITY_TEST_RUNS_REPORT__FAILURE'
)<
  undefined,
  PaginatedResponse<PartialEntityUpdateParams<DataQualityTestRunList>>,
  undefined
>();
