import {
  Configuration,
  AlertApi,
  DataEntityApi,
  AlertTotals,
  AlertApiGetAllAlertsRequest,
  AlertApiGetAssociatedUserAlertsRequest,
  AlertApiGetDependentEntitiesAlertsRequest,
  AlertApiChangeAlertStatusRequest,
  DataEntityApiGetDataEntityAlertsRequest,
  AlertStatus,
  // Alert,
} from 'generated-sources';
import { createAsyncThunk } from '@reduxjs/toolkit';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
// import { CurrentPageInfo } from 'redux/interfaces/common';

const apiClientConf = new Configuration(BASE_PARAMS);
const apiClient = new AlertApi(apiClientConf);
const dataEntitApiClient = new DataEntityApi(apiClientConf);

export const fetchAlertsTotals = createAsyncThunk<AlertTotals>(
  actions.fetchAlertsTotalsActionType,
  async () => {
    const response = await apiClient.getAlertTotals();
    return response;
  }
);

export const fetchAllAlertList = createAsyncThunk<
  // TODO

  // { items: Alert[]; pageInfo: CurrentPageInfo },
  any,
  AlertApiGetAllAlertsRequest
>(actions.fetchAlertListActionType, async ({ page, size }) => {
  const { items, pageInfo } = await apiClient.getAllAlerts({
    page,
    size,
  });
  return {
    items,
    pageInfo: {
      ...pageInfo,
      page,
    },
  };
});

export const fetchMyAlertList = createAsyncThunk<
  // TODO

  // { items: Alert[]; pageInfo: CurrentPageInfo },
  any,
  AlertApiGetAssociatedUserAlertsRequest
>(actions.fetchMyAlertListActionType, async ({ page, size }) => {
  const { items, pageInfo } = await apiClient.getAssociatedUserAlerts({
    page,
    size,
  });
  return {
    items,
    pageInfo: {
      ...pageInfo,
      page,
    },
  };
});

export const fetchMyDependentsAlertList = createAsyncThunk<
  // TODO

  // { items: Alert[]; pageInfo: CurrentPageInfo },
  any,
  AlertApiGetDependentEntitiesAlertsRequest
>(actions.fetchMyDependentsAlertListActionType, async ({ page, size }) => {
  const { items, pageInfo } = await apiClient.getDependentEntitiesAlerts({
    page,
    size,
  });
  return {
    items,
    pageInfo: {
      ...pageInfo,
      page,
    },
  };
});

export const updateAlertStatus = createAsyncThunk<
  { id: number; status: AlertStatus },
  AlertApiChangeAlertStatusRequest
>(
  actions.updateAlertStatusActionType,
  async ({ alertId, alertStatusFormData }) => {
    const response = await apiClient.changeAlertStatus({
      alertId,
      alertStatusFormData,
    });

    return { id: alertId, status: response };
  }
);

export const fetchDataEntityAlerts = createAsyncThunk<
  // TODO

  // { items: Alert[]; pageInfo: CurrentPageInfo },
  any,
  DataEntityApiGetDataEntityAlertsRequest
>(actions.fetchDataEntityAlertsActionType, async ({ dataEntityId }) => {
  const { items, pageInfo } = await dataEntitApiClient.getDataEntityAlerts(
    {
      dataEntityId,
    }
  );
  return { items, pageInfo };
});
