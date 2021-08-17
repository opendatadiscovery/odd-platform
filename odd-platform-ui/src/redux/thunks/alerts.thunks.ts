import {
  Configuration,
  AlertApi,
  DataEntityApi,
  AlertTotals,
  AlertList,
  AlertApiGetAllAlertsRequest,
  AlertApiGetAssociatedUserAlertsRequest,
  AlertApiGetDependentEntitiesAlertsRequest,
  AlertApiChangeAlertStatusRequest,
  DataEntityApiGetDataEntityAlertsRequest,
  AlertStatus,
} from 'generated-sources';
import { createThunk } from 'redux/thunks/base.thunk';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import {
  PaginatedResponse,
  PartialEntityUpdateParams,
} from 'redux/interfaces/common';

const apiClientConf = new Configuration(BASE_PARAMS);
const apiClient = new AlertApi(apiClientConf);
const dataEntitApiClient = new DataEntityApi(apiClientConf);

export const fetchAlertsTotals = createThunk<
  void,
  AlertTotals,
  AlertTotals
>(
  () => apiClient.getAlertTotals(),
  actions.fetchAlertsTotalsAction,
  (response: AlertTotals) => response
);

export const fetchAllAlertList = createThunk<
  AlertApiGetAllAlertsRequest,
  AlertList,
  PaginatedResponse<AlertList>
>(
  (params: AlertApiGetAllAlertsRequest) => apiClient.getAllAlerts(params),
  actions.fetchAlertListAction,
  (response: AlertList, request: AlertApiGetAllAlertsRequest) => ({
    ...response,
    pageInfo: {
      ...response.pageInfo,
      total: response.pageInfo?.total || response.items?.length || 0,
      page: request.page,
      hasNext:
        !!response.items?.length &&
        response.items?.length === request.size,
    },
  })
);

export const fetchMyAlertList = createThunk<
  AlertApiGetAssociatedUserAlertsRequest,
  AlertList,
  PaginatedResponse<AlertList>
>(
  (params: AlertApiGetAssociatedUserAlertsRequest) =>
    apiClient.getAssociatedUserAlerts(params),
  actions.fetchAlertListAction,
  (
    response: AlertList,
    request: AlertApiGetAssociatedUserAlertsRequest
  ) => ({
    ...response,
    pageInfo: {
      ...response.pageInfo,
      total: response.pageInfo?.total || response.items?.length || 0,
      page: request.page,
      hasNext:
        !!response.items?.length &&
        response.items?.length === request.size,
    },
  })
);

export const fetchMyDependentsAlertList = createThunk<
  AlertApiGetDependentEntitiesAlertsRequest,
  AlertList,
  PaginatedResponse<AlertList>
>(
  (params: AlertApiGetDependentEntitiesAlertsRequest) =>
    apiClient.getDependentEntitiesAlerts(params),
  actions.fetchAlertListAction,
  (
    response: AlertList,
    request: AlertApiGetDependentEntitiesAlertsRequest
  ) => ({
    ...response,
    pageInfo: {
      ...response.pageInfo,
      total: response.pageInfo?.total || response.items?.length || 0,
      page: request.page,
      hasNext:
        !!response.items?.length &&
        response.items?.length === request.size,
    },
  })
);

export const updateAlertStatus = createThunk<
  AlertApiChangeAlertStatusRequest,
  AlertStatus,
  PartialEntityUpdateParams<AlertStatus>
>(
  (params: AlertApiChangeAlertStatusRequest) =>
    apiClient.changeAlertStatus(params),
  actions.updateAlertStatusAction,
  (response: AlertStatus, request: AlertApiChangeAlertStatusRequest) => ({
    entityId: request.alertId,
    value: response,
  })
);

export const fetchDataEntityAlerts = createThunk<
  DataEntityApiGetDataEntityAlertsRequest,
  AlertList,
  PartialEntityUpdateParams<AlertList>
>(
  (params: DataEntityApiGetDataEntityAlertsRequest) =>
    dataEntitApiClient.getDataEntityAlerts(params),
  actions.fetchDataEntityAlertsAction,
  (
    response: AlertList,
    request: DataEntityApiGetDataEntityAlertsRequest
  ) => ({
    entityId: request.dataEntityId,
    value: response,
  })
);
