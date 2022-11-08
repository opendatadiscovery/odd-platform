import { Configuration, AppInfoApi, type AppInfo } from 'generated-sources';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { createAsyncThunk } from '@reduxjs/toolkit';

const apiClientConf = new Configuration(BASE_PARAMS);
const apiClient = new AppInfoApi(apiClientConf);

export const fetchAppInfo = createAsyncThunk<AppInfo>(
  actions.fetchAppInfoActionType,
  async () => {
    const response = await apiClient.getAppInfo();
    return response;
  }
);
