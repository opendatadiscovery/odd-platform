import type {
  AlertsState,
  Alert,
  AlertsConfig,
  PaginatedResponse,
} from 'redux/interfaces';
import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { alertsActionPrefix } from 'redux/actions';
import * as thunks from 'redux/thunks';

export const alertsConfigAdapter = createEntityAdapter<AlertsConfig>({
  selectId: config => config.dataEntityId,
});

export const initialState: AlertsState = {
  alerts: {
    items: [],
    pageInfo: { total: 0, page: 0, hasNext: true },
    totals: {},
  },
  dataEntityAlerts: {},
  configs: { ...alertsConfigAdapter.getInitialState() },
};

const updateAlerts = (
  state: AlertsState,
  { payload }: { payload: PaginatedResponse<Alert[]> }
) => {
  const { items, pageInfo } = payload;
  state.alerts.items = pageInfo.page > 1 ? [...state.alerts.items, ...items] : items;
  state.alerts.pageInfo = pageInfo;
};

export const alertsSlice = createSlice({
  name: alertsActionPrefix,
  initialState,
  reducers: {
    changeAlertsFilterAction: state => {
      state.alerts.items = [];
    },
  },
  extraReducers: builder => {
    builder.addCase(thunks.fetchAlertsTotals.fulfilled, (state, { payload }) => {
      state.alerts.totals = payload;
    });

    builder.addCase(thunks.fetchAllAlertList.fulfilled, updateAlerts);
    builder.addCase(thunks.fetchMyAlertList.fulfilled, updateAlerts);
    builder.addCase(thunks.fetchMyDependentsAlertList.fulfilled, updateAlerts);

    builder.addCase(thunks.fetchDataEntityAlerts.fulfilled, (state, { payload }) => {
      const { items, pageInfo, entityId: dataEntityId } = payload;

      const dataEntityAlerts = items.reduce<AlertsState['dataEntityAlerts']>(
        memo => ({
          ...memo,
          [dataEntityId]: {
            ...memo[dataEntityId],
            items:
              pageInfo.page > 1
                ? [...(state.dataEntityAlerts[dataEntityId]?.items || []), ...items]
                : items,
            pageInfo,
          },
        }),
        { ...state.dataEntityAlerts }
      );

      return { ...state, dataEntityAlerts };
    });
    builder.addCase(thunks.updateAlertStatus.fulfilled, (state, { payload }) => {
      const { alert, entityId: dataEntityId } = payload;

      if (dataEntityId) {
        const dataEntityAlerts = state.dataEntityAlerts[dataEntityId].items;
        state.dataEntityAlerts[dataEntityId].items = dataEntityAlerts.map(el =>
          el.id === alert.id ? alert : el
        );
        return state;
      }

      state.alerts.items = state.alerts.items.map(el =>
        el.id === alert.id ? alert : el
      );

      return state;
    });
    builder.addCase(
      thunks.fetchDataEntityAlertsCounts.fulfilled,
      (state, { payload }) => {
        const { entityId: dataEntityId, count } = payload;

        return {
          ...state,
          dataEntityAlerts: {
            ...state.dataEntityAlerts,
            [dataEntityId]: {
              ...state.dataEntityAlerts[dataEntityId],
              alertCount: count,
            },
          },
        };
      }
    );
    builder.addCase(
      thunks.fetchDataEntityAlertsConfig.fulfilled,
      (state, { payload }) => {
        alertsConfigAdapter.setOne(state.configs, payload);
      }
    );
    builder.addCase(
      thunks.updateDataEntityAlertsConfig.fulfilled,
      (state, { payload }) => {
        alertsConfigAdapter.setOne(state.configs, payload);
      }
    );
  },
});
export const { changeAlertsFilterAction } = alertsSlice.actions;
export default alertsSlice.reducer;
