import {
  Configuration,
  AlertApi,
  DataEntityApi,
  AlertTotals,
  AlertList,
  AlertApiGetAllAlertsRequest,
  AlertApiGetAssociatedUserAlertsRequest,
  AlertApiGetDependentEntitiesAlertsRequest,
  DataEntityApiGetDataEntityAlertsRequest,
  AlertType,
  AlertStatus,
} from 'generated-sources';
import { createThunk } from 'redux/thunks/base.thunk';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { PaginatedResponse } from 'redux/interfaces/common';
import { PartialDataEntityUpdateParams } from '../interfaces/dataentities';

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

export const fetchDataEntityAlerts = createThunk<
  DataEntityApiGetDataEntityAlertsRequest,
  AlertList,
  PartialDataEntityUpdateParams<AlertList>
>(
  (params: DataEntityApiGetDataEntityAlertsRequest) =>
    dataEntitApiClient.getDataEntityAlerts(params),
  actions.fetchDataEntityAlertsAction,
  (
    response: AlertList,
    request: DataEntityApiGetDataEntityAlertsRequest
  ) => ({
    dataEntityId: request.dataEntityId,
    value: response,
  })
);
