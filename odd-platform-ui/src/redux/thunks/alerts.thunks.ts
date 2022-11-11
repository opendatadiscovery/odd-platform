import {
  type Alert as GeneratedAlert,
  AlertApi,
  type AlertApiChangeAlertStatusRequest,
  type AlertApiGetAllAlertsRequest,
  type AlertApiGetAssociatedUserAlertsRequest,
  type AlertApiGetDependentEntitiesAlertsRequest,
  type AlertStatus,
  type AlertTotals,
  Configuration,
  DataEntityApi,
  type DataEntityApiGetDataEntityAlertsRequest,
  type PageInfo,
} from 'generated-sources';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import type { Alert, CurrentPageInfo } from 'redux/interfaces';
import { castDatesToTimestampInItemsArray } from 'redux/lib/helpers';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';

const apiClientConf = new Configuration(BASE_PARAMS);
const alertApi = new AlertApi(apiClientConf);
const dataEntityApi = new DataEntityApi(apiClientConf);

export interface AlertsResponse {
  items: Alert[];
  pageInfo: CurrentPageInfo;
}

export const fetchAlertsTotals = handleResponseAsyncThunk<AlertTotals>(
  actions.fetchAlertsTotalsActionType,
  async () => await alertApi.getAlertTotals(),
  {}
);

export const fetchAllAlertList = handleResponseAsyncThunk<
  AlertsResponse,
  AlertApiGetAllAlertsRequest
>(
  actions.fetchAlertListActionType,
  async ({ page, size }) => {
    const { items, pageInfo } = await alertApi.getAllAlerts({ page, size });

    return {
      items: castDatesToTimestampInItemsArray<GeneratedAlert, Alert>(items),
      pageInfo: { ...pageInfo, page },
    };
  },
  {}
);

export const fetchMyAlertList = handleResponseAsyncThunk<
  AlertsResponse,
  AlertApiGetAssociatedUserAlertsRequest
>(
  actions.fetchMyAlertListActionType,
  async ({ page, size }) => {
    const { items, pageInfo } = await alertApi.getAssociatedUserAlerts({ page, size });
    return {
      items: castDatesToTimestampInItemsArray<GeneratedAlert, Alert>(items),
      pageInfo: { ...pageInfo, page },
    };
  },
  {}
);

export const fetchMyDependentsAlertList = handleResponseAsyncThunk<
  AlertsResponse,
  AlertApiGetDependentEntitiesAlertsRequest
>(
  actions.fetchMyDependentsAlertListActionType,
  async ({ page, size }) => {
    const { items, pageInfo } = await alertApi.getDependentEntitiesAlerts({ page, size });
    return {
      items: castDatesToTimestampInItemsArray<GeneratedAlert, Alert>(items),
      pageInfo: { ...pageInfo, page },
    };
  },
  {}
);

export const updateAlertStatus = handleResponseAsyncThunk<
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
  },
  {
    setSuccessOptions: ({ alertStatusFormData, alertId }) => ({
      id: `Alert-updating-${alertId}`,
      message: `Alert successfully ${alertStatusFormData.status?.toLowerCase()}.`,
    }),
  }
);

export const fetchDataEntityAlerts = handleResponseAsyncThunk<
  { items: Alert[]; pageInfo: PageInfo },
  DataEntityApiGetDataEntityAlertsRequest
>(
  actions.fetchDataEntityAlertsActionType,
  async ({ dataEntityId }) => {
    const { items, pageInfo } = await dataEntityApi.getDataEntityAlerts({ dataEntityId });
    return {
      items: castDatesToTimestampInItemsArray<GeneratedAlert, Alert>(items),
      pageInfo,
    };
  },
  {}
);
