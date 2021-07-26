import {
  Configuration,
  DataQualityApiGetDatasetTestReportRequest,
  DataQualityApi,
  DataSetTestReport,
} from 'generated-sources';
import { createThunk } from 'redux/thunks/base.thunk';
import { PartialDataEntityUpdateParams } from 'redux/interfaces/dataentities';
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
