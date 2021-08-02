import {
  Configuration,
  DataQualityApiGetDatasetTestReportRequest,
  DataQualityApi,
  DataSetTestReport,
  DataQualityApiGetDataEntityDataQATestsRequest,
  DataEntityList,
  DataQualityApiGetRunsRequest,
  DataQualityTestRunList,
} from 'generated-sources';
import { createThunk } from 'redux/thunks/base.thunk';
import {
  PartialDataEntityUpdateParams,
  PartialQATestParams,
} from 'redux/interfaces/dataentities';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';

const apiClientConf = new Configuration(BASE_PARAMS);
const datasetQualityTestApiClient = new DataQualityApi(apiClientConf);

export const fetchDataSetQualityTestReport = createThunk<
  DataQualityApiGetDatasetTestReportRequest,
  DataSetTestReport,
  PartialDataEntityUpdateParams<DataSetTestReport>
>(
  (params: DataQualityApiGetDatasetTestReportRequest) =>
    datasetQualityTestApiClient.getDatasetTestReport(params),
  actions.fetchDataSetQualityTestReportAction,
  (
    response: DataSetTestReport,
    request: DataQualityApiGetDatasetTestReportRequest
  ) => ({
    dataEntityId: request.dataEntityId,
    value: response,
  })
);

export const fetchDataSetQualityTestList = createThunk<
  DataQualityApiGetDataEntityDataQATestsRequest,
  DataEntityList,
  PartialDataEntityUpdateParams<DataEntityList>
>(
  (params: DataQualityApiGetDataEntityDataQATestsRequest) =>
    datasetQualityTestApiClient.getDataEntityDataQATests(params),
  actions.fetchDataSetQualityTestListAction,
  (
    response: DataEntityList,
    request: DataQualityApiGetDataEntityDataQATestsRequest
  ) => ({
    dataEntityId: request.dataEntityId,
    value: response,
  })
);

export const fetchDataSetQualityTestRuns = createThunk<
  DataQualityApiGetRunsRequest,
  DataQualityTestRunList,
  PartialQATestParams<DataQualityTestRunList>
>(
  (params: DataQualityApiGetRunsRequest) =>
    datasetQualityTestApiClient.getRuns(params),
  actions.fetchDataSetQualityTestRunsAction,
  (
    response: DataQualityTestRunList,
    request: DataQualityApiGetRunsRequest
  ) => ({
    dataqatestId: request.dataqatestId,
    value: response,
  })
);
