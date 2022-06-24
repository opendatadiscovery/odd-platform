import { AlertsState } from 'redux/interfaces';
import { Alert } from 'generated-sources';
import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { alertsActionPrefix } from 'redux/actions';
import * as thunks from 'redux/thunks';

export const alertsAdapter = createEntityAdapter<Alert>({
  selectId: alert => alert.id,
});

export const initialState: AlertsState = {
  byId: {},
  allIds: [],
  totals: {},
  alertIdsByDataEntityId: {},
  pageInfo: {
    total: 0,
    page: 0,
    hasNext: true,
  },
  ...alertsAdapter.getInitialState(),
};

export const alertsSlice = createSlice({
  name: alertsActionPrefix,
  initialState,
  reducers: {
    changeAlertsFilterAction: alertsAdapter.removeAll,
  },
  extraReducers: builder => {
    builder.addCase(
      thunks.fetchAlertsTotals.fulfilled,
      (state, { payload }) => {
        state.totals = payload;
      }
    );
    builder.addCase(
      thunks.fetchAllAlertList.fulfilled,
      (state, { payload }) => {
        const { items, pageInfo } = payload;
        alertsAdapter.setAll(state, items);
        state.pageInfo = pageInfo;
      }
    );
    builder.addCase(
      thunks.fetchMyAlertList.fulfilled,
      (state, { payload }) => {
        const { items, pageInfo } = payload;
        alertsAdapter.setAll(state, items);
        state.pageInfo = pageInfo;
      }
    );
    builder.addCase(
      thunks.fetchMyDependentsAlertList.fulfilled,
      (state, { payload }) => {
        const { items, pageInfo } = payload;
        alertsAdapter.setAll(state, items);
        state.pageInfo = pageInfo;
      }
    );
    builder.addCase(
      thunks.fetchDataEntityAlerts.fulfilled,
      (state, { payload }) => {
        const { items, pageInfo } = payload;
        alertsAdapter.setAll(state, items);
        state.pageInfo = { ...pageInfo, page: 1 };
      }
    );
    builder.addCase(
      thunks.updateAlertStatus.fulfilled,
      (state, { payload }) => {
        const { alertId, status } = payload;

        const currentAlert = state.entities[alertId];
        if (currentAlert) {
          currentAlert.status = status;
        }
      }
    );
  },
});
export const { changeAlertsFilterAction } = alertsSlice.actions;
export default alertsSlice.reducer;
