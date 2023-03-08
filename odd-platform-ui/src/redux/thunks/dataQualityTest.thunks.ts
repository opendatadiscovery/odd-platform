import type {
  DataEntity,
  DataEntityList,
  DataQualityApiGetDataEntityDataQATestsRequest,
  DataQualityApiGetDatasetSLAReportRequest,
  DataQualityApiGetDatasetTestReportRequest,
  DataQualityApiSetDataQATestSeverityRequest,
  DataSetSLAReport,
  DataSetTestReport,
} from 'generated-sources';
import * as actions from 'redux/actions';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';
import { dataQualityApi } from 'lib/api';

export const fetchDataSetQualityTestReport = handleResponseAsyncThunk<
  { entityId: number; value: DataSetTestReport },
  DataQualityApiGetDatasetTestReportRequest
>(
  actions.fetchDataSetQualityTestReportActionType,
  async ({ dataEntityId }) => {
    const response = await dataQualityApi.getDatasetTestReport({ dataEntityId });
    return { entityId: dataEntityId, value: response };
  },
  {}
);

export const fetchDataSetQualitySLAReport = handleResponseAsyncThunk<
  { entityId: number; value: DataSetSLAReport },
  DataQualityApiGetDatasetSLAReportRequest
>(
  actions.fetchDataSetQualitySLAReportActionType,
  async ({ dataEntityId }) => {
    const response = await dataQualityApi.getDatasetSLAReport({
      dataEntityId,
    });
    return { entityId: dataEntityId, value: response };
  },
  {}
);

export const fetchDataSetQualityTestList = handleResponseAsyncThunk<
  { entityId: number; value: DataEntityList },
  DataQualityApiGetDataEntityDataQATestsRequest
>(
  actions.fetchDataSetQualityTestListActionType,
  async ({ dataEntityId }) => {
    const response = await dataQualityApi.getDataEntityDataQATests({ dataEntityId });

    return { entityId: dataEntityId, value: response };
  },
  { switchOffErrorMessage: true }
);

export const setDataQATestSeverity = handleResponseAsyncThunk<
  DataEntity,
  DataQualityApiSetDataQATestSeverityRequest
>(
  actions.setDataQATestSeverityActionType,
  async ({ dataEntityId, dataqaTestId, dataQualityTestSeverityForm }) =>
    await dataQualityApi.setDataQATestSeverity({
      dataEntityId,
      dataqaTestId,
      dataQualityTestSeverityForm,
    }),
  {
    setSuccessOptions: ({ dataqaTestId }) => ({
      id: `DQSeverity-deleting-${dataqaTestId}`,
      message: `Severity successfully updated.`,
    }),
  }
);
