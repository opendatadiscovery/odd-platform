import { AlertsState } from 'redux/interfaces';
import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { alertsActionPrefix } from 'redux/actions';

import * as thunks from 'redux/thunks';
import { Alert } from 'redux/interfaces/alerts';

export const alertsAdapter = createEntityAdapter<Alert>({
  selectId: alert => alert.id,
  sortComparer: (a, b) => b.createdAt - a.createdAt,
});

export const initialState: AlertsState = {
  totals: {},
  pageInfo: { total: 0, page: 0, hasNext: true },
  ...alertsAdapter.getInitialState(),
};

export const alertsSlice = createSlice({
  name: alertsActionPrefix,
  initialState,
  reducers: {
    changeAlertsFilterAction: alertsAdapter.removeAll,
  },
  extraReducers: builder => {
    builder.addCase(thunks.fetchAlertsTotals.fulfilled, (state, { payload }) => {
      state.totals = payload;
    });
    builder.addCase(thunks.fetchAllAlertList.fulfilled, (state, { payload }) => {
      const { items, pageInfo } = payload;
      alertsAdapter.setMany(state, items);
      state.pageInfo = pageInfo;
    });
    builder.addCase(thunks.fetchMyAlertList.fulfilled, (state, { payload }) => {
      const { items, pageInfo } = payload;
      alertsAdapter.setMany(state, items);
      state.pageInfo = pageInfo;
    });
    builder.addCase(thunks.fetchMyDependentsAlertList.fulfilled, (state, { payload }) => {
      const { items, pageInfo } = payload;
      alertsAdapter.setMany(state, items);
      state.pageInfo = pageInfo;
    });
    builder.addCase(thunks.fetchDataEntityAlerts.fulfilled, (state, { payload }) => {
      const { items, pageInfo } = payload;
      alertsAdapter.setAll(state, items);
      state.pageInfo = { ...pageInfo, page: 1 };
    });
    builder.addCase(thunks.updateAlertStatus.fulfilled, (state, { payload }) => {
      const { alertId, status } = payload;

      const currentAlert = state.entities[alertId];
      if (currentAlert) {
        currentAlert.status = status;
      }
    });
  },
});
export const { changeAlertsFilterAction } = alertsSlice.actions;
export default alertsSlice.reducer;
