import {
  Configuration,
  AppInfoApi,
  AppInfo,
  FeatureApi,
  Feature,
} from 'generated-sources';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { createAsyncThunk } from '@reduxjs/toolkit';

const apiClientConf = new Configuration(BASE_PARAMS);
const appInfoApi = new AppInfoApi(apiClientConf);
const featureApi = new FeatureApi(apiClientConf);

export const fetchAppInfo = createAsyncThunk<AppInfo>(
  actions.fetchAppInfoActionType,
  async () => {
    const response = await appInfoApi.getAppInfo();
    return response;
  }
);

export const fetchActiveFeatures = createAsyncThunk<Feature[]>(
  actions.fetchActiveFeaturesActionType,
  async () => {
    const { items } = await featureApi.getActiveFeatures();
    return items;
  }
);
