import {
  Configuration,
  DataEntityList,
  DataEntityRunApi,
  DataEntityRunApiGetRunsRequest,
  DataEntityRunList,
  DataQualityApi,
  DataQualityApiGetDataEntityDataQATestsRequest,
  DataQualityApiGetDatasetTestReportRequest,
  DataSetTestReport,
} from 'generated-sources';
import { createThunk } from 'redux/thunks/base.thunk';
import {
  PaginatedResponse,
  PartialEntityUpdateParams,
} from 'redux/interfaces';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';

const apiClientConf = new Configuration(BASE_PARAMS);
const datasetQualityTestApiClient = new DataQualityApi(apiClientConf);
const dataEntityRunApi = new DataEntityRunApi(apiClientConf);

export const fetchDataSetQualityTestReport = createThunk<
  DataQualityApiGetDatasetTestReportRequest,
  DataSetTestReport,
  PartialEntityUpdateParams<DataSetTestReport>
>(
  (params: DataQualityApiGetDatasetTestReportRequest) =>
    datasetQualityTestApiClient.getDatasetTestReport(params),
  actions.fetchDataSetQualityTestReportAction,
  (
    response: DataSetTestReport,
    request: DataQualityApiGetDatasetTestReportRequest
  ) => ({
    entityId: request.dataEntityId,
    value: response,
  })
);

export const fetchDataSetQualityTestList = createThunk<
  DataQualityApiGetDataEntityDataQATestsRequest,
  DataEntityList,
  PartialEntityUpdateParams<DataEntityList>
>(
  (params: DataQualityApiGetDataEntityDataQATestsRequest) =>
    datasetQualityTestApiClient.getDataEntityDataQATests(params),
  actions.fetchDataSetQualityTestListAction,
  (
    response: DataEntityList,
    request: DataQualityApiGetDataEntityDataQATestsRequest
  ) => ({
    entityId: request.dataEntityId,
    value: response,
  })
);

export const fetchDataSetQualityTestRuns = createThunk<
  DataEntityRunApiGetRunsRequest,
  DataEntityRunList,
  PartialEntityUpdateParams<PaginatedResponse<DataEntityRunList>>
>(
  (params: DataEntityRunApiGetRunsRequest) =>
    dataEntityRunApi.getRuns(params),
  actions.fetchDataSetQualityTestRunsAction,
  (
    response: DataEntityRunList,
    request: DataEntityRunApiGetRunsRequest
  ) => ({
    entityId: request.dataEntityId,
    value: {
      items: response.items,
      pageInfo: {
        ...response.pageInfo,
        page: request.page,
      },
    },
  })
);
