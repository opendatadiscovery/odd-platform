import {
  Alert,
  AlertApi,
  AlertApiChangeAlertStatusRequest,
  AlertApiGetAllAlertsRequest,
  AlertApiGetAssociatedUserAlertsRequest,
  AlertApiGetDependentEntitiesAlertsRequest,
  AlertStatus,
  AlertTotals,
  Configuration,
  DataEntityApi,
  DataEntityApiGetDataEntityAlertsRequest,
  PageInfo,
} from 'generated-sources';
import { createAsyncThunk } from '@reduxjs/toolkit';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { CurrentPageInfo } from 'redux/interfaces';

const apiClientConf = new Configuration(BASE_PARAMS);
const alertApi = new AlertApi(apiClientConf);
const dataEntityApi = new DataEntityApi(apiClientConf);

export const fetchAlertsTotals = createAsyncThunk<AlertTotals>(
  actions.fetchAlertsTotalsActionType,
  async () => {
    const response = await alertApi.getAlertTotals();
    return response;
  }
);

export const fetchAllAlertList = createAsyncThunk<
  { items: Alert[]; pageInfo: CurrentPageInfo },
  AlertApiGetAllAlertsRequest
>(actions.fetchAlertListActionType, async ({ page, size }) => {
  const { items, pageInfo } = await alertApi.getAllAlerts({
    page,
    size,
  });
  return {
    items,
    pageInfo: { ...pageInfo, page },
  };
});

export const fetchMyAlertList = createAsyncThunk<
  { items: Alert[]; pageInfo: CurrentPageInfo },
  AlertApiGetAssociatedUserAlertsRequest
>(actions.fetchMyAlertListActionType, async ({ page, size }) => {
  const { items, pageInfo } = await alertApi.getAssociatedUserAlerts({
    page,
    size,
  });
  return {
    items,
    pageInfo: { ...pageInfo, page },
  };
});

export const fetchMyDependentsAlertList = createAsyncThunk<
  { items: Alert[]; pageInfo: CurrentPageInfo },
  AlertApiGetDependentEntitiesAlertsRequest
>(actions.fetchMyDependentsAlertListActionType, async ({ page, size }) => {
  const { items, pageInfo } = await alertApi.getDependentEntitiesAlerts({
    page,
    size,
  });
  return {
    items,
    pageInfo: { ...pageInfo, page },
  };
});

export const updateAlertStatus = createAsyncThunk<
  { alertId: number; status: AlertStatus },
  AlertApiChangeAlertStatusRequest
>(
  actions.updateAlertStatusActionType,
  async ({ alertId, alertStatusFormData }) => {
    const status = await alertApi.changeAlertStatus({
      alertId,
      alertStatusFormData,
    });

    return { alertId, status };
  }
);

export const fetchDataEntityAlerts = createAsyncThunk<
  { items: Alert[]; pageInfo: PageInfo },
  DataEntityApiGetDataEntityAlertsRequest
>(actions.fetchDataEntityAlertsActionType, async ({ dataEntityId }) => {
  const { items, pageInfo } = await dataEntityApi.getDataEntityAlerts({
    dataEntityId,
  });
  return { items, pageInfo };
});
