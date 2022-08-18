import {
  Configuration,
  DataEntity,
  DataEntityList,
  DataQualityApi,
  DataQualityApiGetDataEntityDataQATestsRequest,
  DataQualityApiGetDatasetTestReportRequest,
  DataQualityApiSetDataQATestSeverityRequest,
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
>(
  actions.fetchDataSetQualityTestReportActionType,
  async ({ dataEntityId }) => {
    const response = await dataQualityApi.getDatasetTestReport({
      dataEntityId,
    });
    return { entityId: dataEntityId, value: response };
  }
);

export const fetchDataSetQualityTestList = createAsyncThunk<
  {
    entityId: number;
    value: DataEntityList;
  },
  DataQualityApiGetDataEntityDataQATestsRequest
>(
  actions.fetchDataSetQualityTestListActionType,
  async ({ dataEntityId }) => {
    const response = await dataQualityApi.getDataEntityDataQATests({
      dataEntityId,
    });
    return {
      entityId: dataEntityId,
      value: response,
    };
  }
);

export const setDataQATestSeverity = createAsyncThunk<
  DataEntity,
  DataQualityApiSetDataQATestSeverityRequest
>(
  actions.setDataQATestSeverityActionType,
  async ({ dataEntityId, dataqaTestId, dataQualityTestSeverityForm }) => {
    const dataQATest = await dataQualityApi.setDataQATestSeverity({
      dataEntityId,
      dataqaTestId,
      dataQualityTestSeverityForm,
    });
    return dataQATest;
  }
);
