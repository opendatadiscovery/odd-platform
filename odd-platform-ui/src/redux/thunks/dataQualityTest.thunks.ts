import {
  Configuration,
  type DataEntity,
  type DataEntityList,
  DataQualityApi,
  type DataQualityApiGetDataEntityDataQATestsRequest,
  type DataQualityApiGetDatasetSLAReportRequest,
  type DataQualityApiGetDatasetTestReportRequest,
  type DataQualityApiSetDataQATestSeverityRequest,
  type DataSetSLAReport,
  type DataSetTestReport,
} from 'generated-sources';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';

const apiClientConf = new Configuration(BASE_PARAMS);
const dataQualityApi = new DataQualityApi(apiClientConf);

// TODO handle
export const fetchDataSetQualityTestReport = createAsyncThunk<
  { entityId: number; value: DataSetTestReport },
  DataQualityApiGetDatasetTestReportRequest
>(actions.fetchDataSetQualityTestReportActionType, async ({ dataEntityId }) => {
  const response = await dataQualityApi.getDatasetTestReport({
    dataEntityId,
  });
  return { entityId: dataEntityId, value: response };
});

// TODO handle
export const fetchDataSetQualitySLAReport = createAsyncThunk<
  { entityId: number; value: DataSetSLAReport },
  DataQualityApiGetDatasetSLAReportRequest
>(actions.fetchDataSetQualitySLAReportActionType, async ({ dataEntityId }) => {
  const response = await dataQualityApi.getDatasetSLAReport({
    dataEntityId,
  });
  return { entityId: dataEntityId, value: response };
});

// TODO handle
export const fetchDataSetQualityTestList = createAsyncThunk<
  { entityId: number; value: DataEntityList },
  DataQualityApiGetDataEntityDataQATestsRequest
>(actions.fetchDataSetQualityTestListActionType, async ({ dataEntityId }) => {
  const response = await dataQualityApi.getDataEntityDataQATests({
    dataEntityId,
  });
  return {
    entityId: dataEntityId,
    value: response,
  };
});

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
