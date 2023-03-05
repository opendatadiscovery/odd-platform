import React from 'react';
import { Typography } from '@mui/material';
import { Redirect, Route, Switch } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import {
  fetchAlertsTotals,
  fetchAllAlertList,
  fetchMyAlertList,
  fetchMyDependentsAlertList,
} from 'redux/thunks';
import { getAlertsTotals, getOwnership } from 'redux/selectors';
import { changeAlertsFilterAction } from 'redux/slices/alerts.slice';
import AppTabs, { type AppTabItem } from 'components/shared/AppTabs/AppTabs';
import { useAppParams, useAppPaths } from 'lib/hooks';
import type {
  AlertApiGetAllAlertsRequest,
  AlertApiGetAssociatedUserAlertsRequest,
  AlertApiGetDependentEntitiesAlertsRequest,
} from 'generated-sources';
import { type AsyncThunk } from '@reduxjs/toolkit';
import type { AlertsResponse } from 'redux/interfaces';
import * as S from './AlertsStyles';
import AlertsList from './AlertsList/AlertsList';

const Alerts: React.FC = () => {
  const dispatch = useAppDispatch();
  const { viewType } = useAppParams();
  const { alertsPath, AlertsRoutes, alertsBasePath } = useAppPaths();

  const totals = useAppSelector(getAlertsTotals);
  const showMyAndDepends = useAppSelector(getOwnership);
  React.useEffect(() => {
    dispatch(fetchAlertsTotals());
  }, [fetchAlertsTotals]);

  const [tabs, setTabs] = React.useState<AppTabItem[]>([]);

  React.useEffect(() => {
    setTabs([
      {
        name: 'All',
        hint: totals?.total || 0,
        value: AlertsRoutes.all,
        link: alertsPath(AlertsRoutes.all),
      },
      {
        name: 'My Objects',
        hint: totals?.myTotal || 0,
        value: AlertsRoutes.my,
        link: alertsPath(AlertsRoutes.my),
        hidden: !showMyAndDepends,
      },
      {
        name: 'Dependents',
        hint: totals?.dependentTotal || 0,
        value: AlertsRoutes.dependents,
        link: alertsPath(AlertsRoutes.dependents),
        hidden: !showMyAndDepends,
      },
    ]);
  }, [totals, showMyAndDepends]);

  const [selectedTab, setSelectedTab] = React.useState<number>(-1);

  React.useEffect(() => {
    setSelectedTab(viewType ? tabs.findIndex(tab => tab.value === viewType) : 0);
  }, [tabs, viewType]);

  const alertsFilterUpdateAction = React.useCallback(() => {
    dispatch(changeAlertsFilterAction());
  }, [changeAlertsFilterAction]);

  const alertListWithProvider = (
    fetchAlerts: AsyncThunk<
      AlertsResponse,
      | AlertApiGetAllAlertsRequest
      | AlertApiGetAssociatedUserAlertsRequest
      | AlertApiGetDependentEntitiesAlertsRequest,
      Record<string, unknown>
    >
  ) => <AlertsList fetchAlerts={fetchAlerts} />;

  return (
    <S.Container>
      <Typography variant='h1' sx={{ mb: 2.75 }}>
        Alerts
      </Typography>
      <AppTabs
        type='primary'
        items={tabs}
        selectedTab={selectedTab}
        handleTabChange={alertsFilterUpdateAction}
      />
      <Switch>
        <Route
          exact
          path={alertsPath(AlertsRoutes.all)}
          render={() => alertListWithProvider(fetchAllAlertList)}
        />
        <Route
          exact
          path={alertsPath(AlertsRoutes.my)}
          render={() => alertListWithProvider(fetchMyAlertList)}
        />
        <Route
          exact
          path={alertsPath(AlertsRoutes.dependents)}
          render={() => alertListWithProvider(fetchMyDependentsAlertList)}
        />
        <Redirect from={alertsBasePath()} to={alertsPath()} />
      </Switch>
    </S.Container>
  );
};

export default Alerts;
