import {
  Alert as GeneratedAlert,
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
import { Alert, CurrentPageInfo } from 'redux/interfaces';
import { castItemDatesToTimestampInArray } from 'redux/lib/helpers';

const apiClientConf = new Configuration(BASE_PARAMS);
const alertApi = new AlertApi(apiClientConf);
const dataEntityApi = new DataEntityApi(apiClientConf);

export interface AlertsResponse {
  items: Alert[];
  pageInfo: CurrentPageInfo;
}

export const fetchAlertsTotals = createAsyncThunk<AlertTotals>(
  actions.fetchAlertsTotalsActionType,
  async () => alertApi.getAlertTotals()
);

export const fetchAllAlertList = createAsyncThunk<
  AlertsResponse,
  AlertApiGetAllAlertsRequest
>(actions.fetchAlertListActionType, async ({ page, size }) => {
  const { items, pageInfo } = await alertApi.getAllAlerts({
    page,
    size,
  });

  return {
    items: castItemDatesToTimestampInArray<GeneratedAlert, Alert>(items),
    pageInfo: { ...pageInfo, page },
  };
});

export const fetchMyAlertList = createAsyncThunk<
  AlertsResponse,
  AlertApiGetAssociatedUserAlertsRequest
>(actions.fetchMyAlertListActionType, async ({ page, size }) => {
  const { items, pageInfo } = await alertApi.getAssociatedUserAlerts({
    page,
    size,
  });
  return {
    items: castItemDatesToTimestampInArray<GeneratedAlert, Alert>(items),
    pageInfo: { ...pageInfo, page },
  };
});

export const fetchMyDependentsAlertList = createAsyncThunk<
  AlertsResponse,
  AlertApiGetDependentEntitiesAlertsRequest
>(actions.fetchMyDependentsAlertListActionType, async ({ page, size }) => {
  const { items, pageInfo } = await alertApi.getDependentEntitiesAlerts({
    page,
    size,
  });
  return {
    items: castItemDatesToTimestampInArray<GeneratedAlert, Alert>(items),
    pageInfo: { ...pageInfo, page },
  };
});

export const updateAlertStatus = createAsyncThunk<
  { alertId: number; status: AlertStatus },
  AlertApiChangeAlertStatusRequest
>(actions.updateAlertStatusActionType, async ({ alertId, alertStatusFormData }) => {
  const status = await alertApi.changeAlertStatus({
    alertId,
    alertStatusFormData,
  });

  return { alertId, status };
});

export const fetchDataEntityAlerts = createAsyncThunk<
  { items: Alert[]; pageInfo: PageInfo },
  DataEntityApiGetDataEntityAlertsRequest
>(actions.fetchDataEntityAlertsActionType, async ({ dataEntityId }) => {
  const { items, pageInfo } = await dataEntityApi.getDataEntityAlerts({
    dataEntityId,
  });
  return {
    items: castItemDatesToTimestampInArray<GeneratedAlert, Alert>(items),
    pageInfo,
  };
});
