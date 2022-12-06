import {
  AlertApi,
  type AlertApiChangeAlertStatusRequest,
  type AlertApiGetAllAlertsRequest,
  type AlertApiGetAssociatedUserAlertsRequest,
  type AlertApiGetDependentEntitiesAlertsRequest,
  type AlertStatus,
  type AlertTotals,
  Configuration,
  DataEntityAlertConfig,
  DataEntityApi,
  DataEntityApiGetAlertConfigRequest,
  type DataEntityApiGetDataEntityAlertsRequest,
  DataEntityApiUpdateAlertConfigRequest,
  type PageInfo,
} from 'generated-sources';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import type {
  Alert,
  AlertsConfig,
  AlertsResponse,
  SerializeDateToNumber,
} from 'redux/interfaces';
import { castDatesToTimestamp } from 'redux/lib/helpers';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';
import { toDateWithoutOffset } from 'lib/helpers';

const apiClientConf = new Configuration(BASE_PARAMS);
const alertApi = new AlertApi(apiClientConf);
const dataEntityApi = new DataEntityApi(apiClientConf);

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
      items: castDatesToTimestamp(items),
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
      items: castDatesToTimestamp(items),
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
      items: castDatesToTimestamp(items),
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

    return { items: castDatesToTimestamp(items), pageInfo };
  },
  { switchOffErrorMessage: true }
);

export const fetchDataEntityAlertsConfig = handleResponseAsyncThunk<
  AlertsConfig,
  DataEntityApiGetAlertConfigRequest
>(
  actions.getDataEntityAlertsConfig,
  async ({ dataEntityId }) => {
    const config = await dataEntityApi.getAlertConfig({ dataEntityId });

    return { dataEntityId, config: castDatesToTimestamp(config) };
  },
  {}
);

export const updateDataEntityAlertsConfig = handleResponseAsyncThunk<
  AlertsConfig,
  SerializeDateToNumber<DataEntityApiUpdateAlertConfigRequest>
>(
  actions.updateDataEntityAlertsConfig,
  async ({ dataEntityId, dataEntityAlertConfig }) => {
    const entries = Object.entries(dataEntityAlertConfig).map(
      ([alertType, timeStamp]) => [
        alertType,
        timeStamp ? toDateWithoutOffset(timeStamp) : undefined,
      ]
    );

    const parsedConfig: DataEntityAlertConfig = Object.fromEntries(entries);
    const config = await dataEntityApi.updateAlertConfig({
      dataEntityId,
      dataEntityAlertConfig: parsedConfig,
    });

    return { dataEntityId, config: castDatesToTimestamp(config) };
  },
  {
    setSuccessOptions: ({ dataEntityId }) => ({
      id: `Alert-config-updating-${dataEntityId}`,
      message: `Alert config successfully updated.`,
    }),
  }
);
