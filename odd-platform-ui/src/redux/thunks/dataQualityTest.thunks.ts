import {
  Configuration,
  DataEntity,
  DataEntityList,
  DataQualityApi,
  DataQualityApiGetDataEntityDataQATestsRequest,
  DataQualityApiGetDatasetSLAReportRequest,
  DataQualityApiGetDatasetTestReportRequest,
  DataQualityApiSetDataQATestSeverityRequest,
  DataSetSLAReport,
  DataSetTestReport,
} from 'generated-sources';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { createAsyncThunk } from '@reduxjs/toolkit';

const apiClientConf = new Configuration(BASE_PARAMS);
const dataQualityApi = new DataQualityApi(apiClientConf);

export const fetchDataSetQualityTestReport = createAsyncThunk<
  { entityId: number; value: DataSetTestReport },
  DataQualityApiGetDatasetTestReportRequest
>(actions.fetchDataSetQualityTestReportActionType, async ({ dataEntityId }) => {
  const response = await dataQualityApi.getDatasetTestReport({
    dataEntityId,
  });
  return { entityId: dataEntityId, value: response };
});

export const fetchDataSetQualitySLAReport = createAsyncThunk<
  { entityId: number; value: DataSetSLAReport },
  DataQualityApiGetDatasetSLAReportRequest
>(actions.fetchDataSetQualitySLAReportActionType, async ({ dataEntityId }) => {
  const response = await dataQualityApi.getDatasetSLAReport({
    dataEntityId,
  });
  return { entityId: dataEntityId, value: response };
});

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

export const setDataQATestSeverity = createAsyncThunk<
  DataEntity,
  DataQualityApiSetDataQATestSeverityRequest
>(
  actions.setDataQATestSeverityActionType,
  async ({ dataEntityId, dataqaTestId, dataQualityTestSeverityForm }) =>
    dataQualityApi.setDataQATestSeverity({
      dataEntityId,
      dataqaTestId,
      dataQualityTestSeverityForm,
    })
);
