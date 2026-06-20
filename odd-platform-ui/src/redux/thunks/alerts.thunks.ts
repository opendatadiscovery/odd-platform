import type {
  AlertApiChangeAlertStatusRequest,
  AlertApiGetAlertCountsRequest,
  AlertApiGetAlertsListRequest,
  AlertCountInfo,
  DataEntityAlertConfig,
  DataEntityApiGetAlertConfigRequest,
  DataEntityApiGetDataEntityAlertsCountsRequest,
  DataEntityApiGetDataEntityAlertsListRequest,
  DataEntityApiUpdateAlertConfigRequest,
} from 'generated-sources';
import * as actions from 'redux/actions';
import type {
  Alert,
  AlertsConfig,
  EntityId,
  PaginatedResponse,
  RelatedToEntityId,
  SerializeDateToNumber,
} from 'redux/interfaces';
import { castDatesToTimestamp } from 'redux/lib/helpers';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';
import { toDate } from 'lib/helpers';
import { alertApi, dataEntityApi } from 'lib/api';

export const alertsListSize = 30;

// The new alerts list endpoint returns a BARE Alert[] (no PageInfo envelope), so paging is
// length-based: a full page (size items) means there may be more. `page` is echoed back so the
// reducer can tell a first page (replace) from a continuation (append) the same way the legacy
// PaginatedResponse flow did.
export const fetchAlerts = handleResponseAsyncThunk<
  PaginatedResponse<Alert[]>,
  SerializeDateToNumber<AlertApiGetAlertsListRequest>
>(
  actions.fetchAlertListActionType,
  async ({ beginDate, endDate, ...params }) => {
    const items = await alertApi.getAlertsList({
      ...params,
      beginDate: beginDate ? toDate(beginDate) : undefined,
      endDate: endDate ? toDate(endDate) : undefined,
    });

    return {
      items: castDatesToTimestamp(items),
      pageInfo: {
        page: params.page,
        hasNext: items.length === params.size,
        total: items.length,
      },
    };
  },
  { switchOffErrorMessage: true }
);

export const fetchAlertCounts = handleResponseAsyncThunk<
  AlertCountInfo,
  SerializeDateToNumber<AlertApiGetAlertCountsRequest>
>(
  actions.fetchAlertCountsActionType,
  async ({ beginDate, endDate, ...params }) =>
    alertApi.getAlertCounts({
      ...params,
      beginDate: beginDate ? toDate(beginDate) : undefined,
      endDate: endDate ? toDate(endDate) : undefined,
    }),
  { switchOffErrorMessage: true }
);

export const updateAlertStatus = handleResponseAsyncThunk<
  { alert: Alert } & Partial<EntityId>,
  AlertApiChangeAlertStatusRequest & Partial<EntityId>
>(
  actions.updateAlertStatusActionType,
  async params => {
    const alert = await alertApi.changeAlertStatus(params);

    return { alert: castDatesToTimestamp(alert), dataEntityId: params.entityId };
  },
  {
    setSuccessOptions: ({ alertStatusFormData, alertId }) => ({
      id: `Alert-updating-${alertId}`,
      message: `Alert successfully ${alertStatusFormData.status?.toLowerCase()}.`,
    }),
  }
);

// Per-entity alerts list. Mirrors the global list (bare Alert[], length-based paging) and carries the
// optional period + status filters surfaced on the Data Entity > Alerts tab. The tab defaults to no
// status (all-time, every status) so the entity's resolved history stays visible.
export const fetchDataEntityAlerts = handleResponseAsyncThunk<
  RelatedToEntityId<PaginatedResponse<Alert[]>>,
  SerializeDateToNumber<DataEntityApiGetDataEntityAlertsListRequest>
>(
  actions.fetchDataEntityAlertsActionType,
  async ({ beginDate, endDate, ...params }) => {
    const { page, size, dataEntityId } = params;
    const items = await dataEntityApi.getDataEntityAlertsList({
      ...params,
      beginDate: beginDate ? toDate(beginDate) : undefined,
      endDate: endDate ? toDate(endDate) : undefined,
    });

    return {
      items: castDatesToTimestamp(items),
      pageInfo: { page, hasNext: items.length === size, total: items.length },
      entityId: dataEntityId,
    };
  },
  { switchOffErrorMessage: true }
);

export const fetchDataEntityAlertsCounts = handleResponseAsyncThunk<
  RelatedToEntityId<{ count: number }>,
  DataEntityApiGetDataEntityAlertsCountsRequest
>(
  actions.fetchDataEntityAlertsCountActionType,
  async params => {
    const { dataEntityId } = params;
    const count = await dataEntityApi.getDataEntityAlertsCounts(params);

    return { count, entityId: dataEntityId };
  },
  {}
);

export const fetchDataEntityAlertsConfig = handleResponseAsyncThunk<
  AlertsConfig,
  DataEntityApiGetAlertConfigRequest
>(
  actions.fetchDataEntityAlertsConfig,
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
      ([alertType, timeStamp]) => [alertType, timeStamp ? toDate(timeStamp) : undefined]
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
